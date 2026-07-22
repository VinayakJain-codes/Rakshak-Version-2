-- 1. Create Enums
CREATE TYPE public.app_role AS ENUM ('SUPER_ADMIN', 'CLIENT_OWNER', 'SUPERVISOR', 'GUARD');

-- 2. Create Tenants table
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Create Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 4. Create Guards table
CREATE TABLE public.guards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  shift_status text DEFAULT 'OFF_DUTY',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 5. Helper Functions for RLS (reading from JWT)
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  select nullif(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role', '')::text;
$$;

CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  select nullif(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', '')::uuid;
$$;

-- 6. Custom Access Token Hook
-- Supabase expects the hook to have this signature:
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql STABLE
AS $$
  DECLARE
    claims jsonb;
    user_role public.app_role;
    user_tenant_id uuid;
  BEGIN
    -- Get the user's role and tenant_id from the profiles table
    SELECT role, tenant_id INTO user_role, user_tenant_id
    FROM public.profiles
    WHERE id = (event->>'user_id')::uuid;

    claims := event->'claims';

    IF user_role IS NOT NULL THEN
      claims := jsonb_set(claims, '{app_metadata, role}', to_jsonb(user_role));
    END IF;

    IF user_tenant_id IS NOT NULL THEN
      claims := jsonb_set(claims, '{app_metadata, tenant_id}', to_jsonb(user_tenant_id));
    END IF;

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    RETURN event;
  END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM authenticated, anon, public;

-- 7. Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guards ENABLE ROW LEVEL SECURITY;

-- 8. Policies for Tenants
-- Super Admin can do everything. Client Owner can read/update their own tenant.
CREATE POLICY "Super Admins can manage all tenants" ON public.tenants
  FOR ALL USING (auth.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (id = auth.tenant_id());

CREATE POLICY "Client Owners can update their own tenant" ON public.tenants
  FOR UPDATE USING (id = auth.tenant_id() AND auth.user_role() = 'CLIENT_OWNER');


-- 9. Policies for Profiles
-- Super Admins can manage all profiles. Client Owners can manage profiles in their tenant.
-- Users can view their own profile.
CREATE POLICY "Super Admins can manage all profiles" ON public.profiles
  FOR ALL USING (auth.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Tenant Admins can manage profiles in their tenant" ON public.profiles
  FOR ALL USING (tenant_id = auth.tenant_id() AND auth.user_role() IN ('CLIENT_OWNER', 'SUPERVISOR'));

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());


-- 10. Policies for Guards
-- Super Admins can manage all.
-- Supervisors and Client Owners can manage guards in their tenant.
-- Guards can view their own record and update their shift_status.
CREATE POLICY "Super Admins can manage all guards" ON public.guards
  FOR ALL USING (auth.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Tenant management can manage guards" ON public.guards
  FOR ALL USING (tenant_id = auth.tenant_id() AND auth.user_role() IN ('CLIENT_OWNER', 'SUPERVISOR'));

CREATE POLICY "Guards can view their own record" ON public.guards
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Guards can update their own record" ON public.guards
  FOR UPDATE USING (profile_id = auth.uid());

-- 1. Update public.tenants
ALTER TABLE public.tenants
ADD COLUMN owner_email text,
ADD COLUMN billing_tier text DEFAULT 'free',
ADD COLUMN guard_capacity int DEFAULT 10,
ADD COLUMN site_capacity int DEFAULT 5,
ADD COLUMN custom_pricing jsonb DEFAULT '{}'::jsonb,
ADD COLUMN features jsonb DEFAULT '{"ai_reports": false, "custom_branding": false}'::jsonb,
ADD COLUMN status text DEFAULT 'ACTIVE';

-- 2. Create public.support_tickets
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'OPEN',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage all support tickets" ON public.support_tickets
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Tenant users can view their own tickets" ON public.support_tickets
  FOR SELECT USING (tenant_id = public.tenant_id());

CREATE POLICY "Tenant users can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (tenant_id = public.tenant_id());


-- 3. Create public.audit_logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_resource text NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (public.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Client Owners can view their own tenant audit logs" ON public.audit_logs
  FOR SELECT USING (tenant_id = public.tenant_id() AND public.user_role() = 'CLIENT_OWNER');


-- 4. Create public.system_metrics (we can just use a simple stats table or view)
CREATE TABLE public.platform_metrics_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_tenants int NOT NULL DEFAULT 0,
  total_guards int NOT NULL DEFAULT 0,
  revenue numeric(10,2) NOT NULL DEFAULT 0,
  recorded_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.platform_metrics_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can view metrics" ON public.platform_metrics_history
  FOR SELECT USING (public.user_role() = 'SUPER_ADMIN');

-- Function to dynamically get current system metrics
CREATE OR REPLACE FUNCTION public.get_current_metrics()
RETURNS TABLE (total_tenants bigint, total_guards bigint)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT 
    (SELECT count(*) FROM public.tenants),
    (SELECT count(*) FROM public.guards);
$$;
-- 1. Create public.sites
CREATE TABLE public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage all sites" ON public.sites
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Tenant users can view their own sites" ON public.sites
  FOR SELECT USING (tenant_id = public.tenant_id());

CREATE POLICY "Tenant management can manage sites" ON public.sites
  FOR ALL USING (tenant_id = public.tenant_id() AND public.user_role() IN ('CLIENT_OWNER', 'SUPERVISOR'));


-- 2. Create public.supervisor_sites
CREATE TABLE public.supervisor_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(supervisor_id, site_id)
);

ALTER TABLE public.supervisor_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage supervisor_sites" ON public.supervisor_sites
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Client Owners can manage supervisor_sites" ON public.supervisor_sites
  FOR ALL USING (tenant_id = public.tenant_id() AND public.user_role() = 'CLIENT_OWNER');

CREATE POLICY "Supervisors can view their own sites" ON public.supervisor_sites
  FOR SELECT USING (supervisor_id = auth.uid());


-- 3. Create public.incidents (Reports & Compliance)
CREATE TABLE public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  guard_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  description text NOT NULL,
  status text DEFAULT 'OPEN',
  severity text DEFAULT 'LOW',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage incidents" ON public.incidents
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Tenant users can view their own incidents" ON public.incidents
  FOR SELECT USING (tenant_id = public.tenant_id());

CREATE POLICY "Guards can create incidents" ON public.incidents
  FOR INSERT WITH CHECK (tenant_id = public.tenant_id());


-- 4. Create public.guard_attendance
CREATE TABLE public.guard_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  guard_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  clock_in timestamptz NOT NULL,
  clock_out timestamptz,
  status text DEFAULT 'PRESENT',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.guard_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage attendance" ON public.guard_attendance
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Tenant users can view their own attendance records" ON public.guard_attendance
  FOR SELECT USING (tenant_id = public.tenant_id());

CREATE POLICY "Guards can manage own attendance" ON public.guard_attendance
  FOR ALL USING (guard_id = auth.uid());
-- 1. Create public.invoices
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  status text DEFAULT 'PENDING',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage all invoices" ON public.invoices
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Tenant users can view their own invoices" ON public.invoices
  FOR SELECT USING (tenant_id = public.tenant_id());
-- 1. Create guard_checkins table
CREATE TABLE public.guard_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES public.guard_schedules(id) ON DELETE CASCADE,
  guard_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  verification_result text NOT NULL, -- e.g., 'PASS', 'FAIL'
  verification_score numeric,
  model_version text,
  failure_reason text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.guard_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage all checkins" ON public.guard_checkins
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Tenant management can view checkins" ON public.guard_checkins
  FOR SELECT USING (tenant_id = public.tenant_id() AND public.user_role() IN ('CLIENT_OWNER', 'SUPERVISOR'));

CREATE POLICY "Guards can view their own checkins" ON public.guard_checkins
  FOR SELECT USING (guard_id = auth.uid());
  
-- Note: Insertions are done by the Next.js server route (service role), not directly by the client browser.

-- 2. Create Storage Bucket for check-in photos
INSERT INTO storage.buckets (id, name, public) VALUES ('checkin_photos', 'checkin_photos', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
CREATE POLICY "Super Admins can access all photos"
  ON storage.objects FOR ALL
  USING (bucket_id = 'checkin_photos' AND public.user_role() = 'SUPER_ADMIN');

-- Give the server service role access to insert and read. (Service role bypasses RLS, so no policy needed strictly, but good practice if using standard client on backend).
-- Give supervisors ability to view photos for their tenant
CREATE POLICY "Tenant management can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'checkin_photos' AND (select tenant_id from public.profiles where id = auth.uid()) = (select tenant_id from public.profiles where id = auth.uid()) AND public.user_role() IN ('CLIENT_OWNER', 'SUPERVISOR'));

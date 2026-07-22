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


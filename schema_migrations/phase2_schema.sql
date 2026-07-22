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

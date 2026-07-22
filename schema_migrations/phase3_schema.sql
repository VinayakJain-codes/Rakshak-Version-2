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

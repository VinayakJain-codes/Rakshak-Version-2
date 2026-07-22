-- 1. Create guard_schedules
CREATE TABLE public.guard_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guard_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE,
  task_type text NOT NULL,
  scheduled_time timestamptz NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.guard_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage all schedules" ON public.guard_schedules
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Tenant management can manage schedules" ON public.guard_schedules
  FOR ALL USING (tenant_id = public.tenant_id() AND public.user_role() IN ('CLIENT_OWNER', 'SUPERVISOR'));

CREATE POLICY "Guards can view and update their own schedules" ON public.guard_schedules
  FOR ALL USING (guard_id = auth.uid());


-- 2. Create guard_schedule_rules
CREATE TABLE public.guard_schedule_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guard_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE,
  task_type text NOT NULL,
  interval_minutes int NOT NULL,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.guard_schedule_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage all schedule rules" ON public.guard_schedule_rules
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Tenant management can manage schedule rules" ON public.guard_schedule_rules
  FOR ALL USING (tenant_id = public.tenant_id() AND public.user_role() IN ('CLIENT_OWNER', 'SUPERVISOR'));


-- 3. Create guard_notifications
CREATE TABLE public.guard_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guard_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.guard_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage all notifications" ON public.guard_notifications
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Tenant management can manage notifications" ON public.guard_notifications
  FOR ALL USING (tenant_id = public.tenant_id() AND public.user_role() IN ('CLIENT_OWNER', 'SUPERVISOR'));

CREATE POLICY "Guards can view and update their own notifications" ON public.guard_notifications
  FOR ALL USING (guard_id = auth.uid());


-- 4. Create alerts
CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guard_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE,
  severity text DEFAULT 'CRITICAL',
  message text NOT NULL,
  status text DEFAULT 'OPEN',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage all alerts" ON public.alerts
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');

CREATE POLICY "Tenant management can manage alerts" ON public.alerts
  FOR ALL USING (tenant_id = public.tenant_id() AND public.user_role() IN ('CLIENT_OWNER', 'SUPERVISOR'));

CREATE POLICY "Guards can view and insert their own alerts" ON public.alerts
  FOR ALL USING (guard_id = auth.uid());

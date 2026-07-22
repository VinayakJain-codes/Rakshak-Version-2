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

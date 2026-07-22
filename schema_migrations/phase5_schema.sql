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

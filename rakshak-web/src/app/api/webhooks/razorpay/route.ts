import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_placeholder'

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = JSON.parse(body)
    const event = payload.event

    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload.payload.payment.entity
      const orderId = payment.order_id

      // We need a service role client to bypass RLS and update across any tenant
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // 1. Get the invoice to find the tenant_id
      const { data: invoice, error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .select('tenant_id')
        .eq('razorpay_order_id', orderId)
        .single()

      if (invoiceError || !invoice) {
        console.error('Invoice not found for order:', orderId)
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }

      const tenantId = invoice.tenant_id

      // 2. Update the invoice status
      await supabaseAdmin
        .from('invoices')
        .update({
          status: 'PAID',
          razorpay_payment_id: payment.id,
          razorpay_signature: signature,
        })
        .eq('razorpay_order_id', orderId)

      // 3. Upgrade the tenant
      await supabaseAdmin
        .from('tenants')
        .update({
          billing_tier: 'pro',
          guard_capacity: 50, // Upgrade capacity
          site_capacity: 25,
          features: { ai_reports: true, custom_branding: true }
        })
        .eq('id', tenantId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

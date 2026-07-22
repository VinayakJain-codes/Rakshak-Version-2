import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Razorpay from 'razorpay'

// Initialize Razorpay
// Note: We use process.env to ensure server-only access
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = user.app_metadata?.tenant_id
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 })
    }

    const { tier } = await request.json()
    
    // Determine pricing based on tier
    let amount = 0
    if (tier === 'pro') {
      amount = 2500 * 100 // ₹2,500 in paise
    } else {
      return NextResponse.json({ error: 'Invalid tier specified' }, { status: 400 })
    }

    // Create order with Razorpay
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${tenantId}_${Date.now()}`,
    })

    if (!order) {
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 })
    }

    // Insert pending invoice into public.invoices
    // We use a service role client or standard client to insert, depending on RLS. 
    // Standard client is fine since it's the user's own tenant.
    const { error: dbError } = await supabase
      .from('invoices')
      .insert({
        tenant_id: tenantId,
        amount: amount / 100, // store in rupees
        currency: 'INR',
        status: 'PENDING',
        razorpay_order_id: order.id,
      })

    if (dbError) {
      console.error('Error inserting invoice:', dbError)
      // Even if our DB insert fails, we could return error or proceed, but safer to fail
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ orderId: order.id })
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

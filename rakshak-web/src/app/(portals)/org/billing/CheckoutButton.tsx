'use client'

import { useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutButton({ currentTier, tenantId }: { currentTier: string, tenantId: string }) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    try {
      setLoading(true)
      // 1. Create order on server
      const res = await fetch('/api/billing/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'pro' })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Enter the Key ID generated from the Dashboard
        amount: 250000, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "Rakshak Security",
        description: "Pro Tier Upgrade",
        image: "https://example.com/your_logo",
        order_id: data.orderId, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        handler: function (response: any) {
            alert('Payment Successful! Your account will be upgraded momentarily.')
            // You can also verify the signature client-side, but server webhook is safer
            // window.location.reload()
        },
        prefill: {
            name: "Tenant Owner",
            email: "owner@example.com",
            contact: "9000090000"
        },
        theme: {
            color: "#000000"
        }
      }

      const rzp1 = new window.Razorpay(options)
      rzp1.on('payment.failed', function (response: any){
              alert(response.error.description)
      })
      rzp1.open()
      
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (currentTier === 'pro') {
    return (
      <button className="px-4 py-2 bg-gray-300 text-gray-500 cursor-not-allowed rounded-md font-medium text-sm" disabled>
        Pro Plan Active
      </button>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button 
        onClick={handleUpgrade}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 text-sm disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Upgrade to Pro (₹2,500/mo)'}
      </button>
    </>
  )
}

'use client'

import { useState } from 'react'
import { resolveAlert } from '@/app/actions/ops'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function ResolveAlertButton({ alertId }: { alertId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleResolve() {
    setLoading(true)
    try {
      await resolveAlert(alertId)
    } catch (err: any) {
      alert(err.message || 'Failed to resolve alert')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleResolve}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer shrink-0"
      title="Mark Alert as Resolved"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5" />
      )}
      <span>Resolve</span>
    </button>
  )
}

'use client'

import { useState } from 'react'
import { raiseAlert } from '@/app/actions/ops'
import Link from 'next/link'
import { ShieldAlert, AlertTriangle, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react'

export default function RaiseAlertPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await raiseAlert(new FormData(e.currentTarget))
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Failed to raise emergency alert')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 max-w-md w-full border border-red-500/30 text-center space-y-5 animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-red-600 dark:text-red-400">Emergency Alert Dispatched!</h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Your field supervisor and security control room have been notified immediately with highest priority. Stay safe and stand by.
            </p>
          </div>
          <Link 
            href="/guard" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 flex items-center gap-2">
          <ShieldAlert className="w-7 h-7" />
          <span>Raise Emergency Alert</span>
        </h1>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
          Transmit an immediate high-priority SOS alert to your supervisor. Use only for genuine security emergencies.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Alert Form */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-red-500/30 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Severity Level</label>
            <select 
              name="severity" 
              required 
              className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            >
              <option value="HIGH" className="bg-background text-foreground dark:bg-slate-900 dark:text-white">🔴 HIGH — Immediate Danger / Incident in Progress</option>
              <option value="MEDIUM" className="bg-background text-foreground dark:bg-slate-900 dark:text-white">🟠 MEDIUM — Urgent Situation / Security Breach</option>
              <option value="LOW" className="bg-background text-foreground dark:bg-slate-900 dark:text-white">🟡 LOW — Non-Critical Security Concern</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Situation Description</label>
            <textarea
              name="description"
              required
              rows={5}
              placeholder="Describe what is happening, your exact post location, and any immediate assistance required..."
              className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-foreground text-xs font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl font-extrabold text-xs shadow-lg transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transmitting SOS Alert...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>🚨 DISPATCH EMERGENCY ALERT NOW</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

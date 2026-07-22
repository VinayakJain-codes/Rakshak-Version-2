'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createScheduleRule } from '@/app/actions/ops'
import { RefreshCw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function RecurringForm({ guards, sites }: { guards: any[], sites: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setMessage(''); setError('')
    try {
      await createScheduleRule(new FormData(e.currentTarget))
      setMessage('Recurring rule created!')
      router.refresh()
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) { 
      setError(err.message || 'Failed to create recurring rule') 
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border">
        <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
          <RefreshCw className="w-4.5 h-4.5" />
        </div>
        <h2 className="text-sm font-extrabold text-foreground">Recurring Schedule Rule</h2>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Select Guard</label>
          <select 
            name="guardId" 
            required 
            className="w-full px-3.5 py-2.5 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          >
            <option value="" className="bg-background text-foreground dark:bg-slate-900 dark:text-white">Choose Guard Officer...</option>
            {guards.map(g => (
              <option key={g.id} value={g.id} className="bg-background text-foreground dark:bg-slate-900 dark:text-white">
                {g.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Select Property (Optional)</label>
          <select 
            name="siteId" 
            className="w-full px-3.5 py-2.5 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          >
            <option value="" className="bg-background text-foreground dark:bg-slate-900 dark:text-white">All Sites / General</option>
            {sites.map(s => (
              <option key={s.id} value={s.id} className="bg-background text-foreground dark:bg-slate-900 dark:text-white">
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Task Type</label>
          <select 
            name="taskType" 
            className="w-full px-3.5 py-2.5 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          >
            <option value="CHECK_IN" className="bg-background text-foreground dark:bg-slate-900 dark:text-white">Check In</option>
            <option value="PATROL" className="bg-background text-foreground dark:bg-slate-900 dark:text-white">Perimeter Patrol</option>
            <option value="REPORT" className="bg-background text-foreground dark:bg-slate-900 dark:text-white">Incident Report</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Repeat Frequency</label>
          <select 
            name="intervalMinutes" 
            className="w-full px-3.5 py-2.5 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          >
            <option value="30" className="bg-background text-foreground dark:bg-slate-900 dark:text-white">Every 30 minutes</option>
            <option value="60" className="bg-background text-foreground dark:bg-slate-900 dark:text-white">Every 1 hour</option>
            <option value="120" className="bg-background text-foreground dark:bg-slate-900 dark:text-white">Every 2 hours</option>
            <option value="240" className="bg-background text-foreground dark:bg-slate-900 dark:text-white">Every 4 hours</option>
            <option value="480" className="bg-background text-foreground dark:bg-slate-900 dark:text-white">Every 8 hours</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Creating Rule...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Create Recurring Rule</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

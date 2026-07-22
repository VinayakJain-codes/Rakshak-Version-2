'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSchedule } from '@/app/actions/ops'
import { Calendar, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

export default function ScheduleForm({ guards, sites }: { guards: any[], sites: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setMessage(''); setError('')
    try {
      const formData = new FormData(e.currentTarget)
      const rawTime = formData.get('scheduledTime') as string
      if (rawTime) {
        // Convert browser local time to ISO string (UTC)
        formData.set('scheduledTime', new Date(rawTime).toISOString())
      }
      await createSchedule(formData)
      setMessage('Schedule created successfully!')
      router.refresh()
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) { 
      setError(err.message || 'Failed to create schedule') 
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
          <Calendar className="w-4.5 h-4.5" />
        </div>
        <h2 className="text-sm font-extrabold text-foreground">One-off Check-in Schedule</h2>
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
          <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Date & Time</label>
          <input 
            type="datetime-local" 
            name="scheduledTime" 
            required 
            className="w-full px-3.5 py-2.5 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Scheduling...</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5" />
              <span>Create Schedule</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

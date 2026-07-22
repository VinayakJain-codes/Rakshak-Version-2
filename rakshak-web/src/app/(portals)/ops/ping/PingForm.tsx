'use client'

import { useState } from 'react'
import { sendNotification, broadcastNotification } from '@/app/actions/ops'
import { Radio, Zap, Loader2, CheckCircle2, AlertCircle, Users, User } from 'lucide-react'

export default function PingForm({ guards }: { guards: any[] }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [targetMode, setTargetMode] = useState<'SPECIFIC' | 'BROADCAST'>('SPECIFIC')
  const [title, setTitle] = useState('')
  const [bodyText, setBodyText] = useState('')

  const presets = [
    { label: '⚡ Urgent Check-in Required', title: 'Urgent Check-in Required', text: 'Please acknowledge your active post location immediately.' },
    { label: '🛡️ Perimeter Patrol Audit', title: 'Perimeter Patrol Audit', text: 'Conduct a thorough perimeter check and log any anomalies.' },
    { label: '📋 Shift Handover Notice', title: 'Shift Handover Notice', text: 'Prepare your daily log sheet for supervisor shift handover.' },
    { label: '✅ All-Clear Status Ping', title: 'All-Clear Status Ping', text: 'Reply to confirm all security entry points are secure.' },
  ]

  function applyPreset(p: typeof presets[0]) {
    setTitle(p.title)
    setBodyText(p.text)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const formData = new FormData(e.currentTarget)
      if (targetMode === 'BROADCAST') {
        await broadcastNotification(formData)
        setMessage('Broadcast signal dispatched to ALL active guards!')
      } else {
        await sendNotification(formData)
        setMessage('Signal dispatched successfully to officer!')
      }
      setTitle('')
      setBodyText('')
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) { 
      setError(err.message || 'Failed to send signal') 
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-7 border border-border space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-500">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-foreground">Dispatch Signal Console</h2>
          <p className="text-xs text-muted-foreground">Send instant real-time operational pings to personnel</p>
        </div>
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

      {/* Target Mode Selector Tabs */}
      <div>
        <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">Dispatch Target</label>
        <div className="grid grid-cols-2 gap-2 bg-black/5 dark:bg-white/5 border border-border rounded-2xl p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTargetMode('SPECIFIC')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              targetMode === 'SPECIFIC' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Specific Guard</span>
          </button>
          <button
            type="button"
            onClick={() => setTargetMode('BROADCAST')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              targetMode === 'BROADCAST' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Broadcast All ({guards.length})</span>
          </button>
        </div>
      </div>

      {/* Quick Signal Presets */}
      <div>
        <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">Quick Presets</label>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-[11px] font-bold bg-black/5 dark:bg-white/5 hover:bg-primary/10 hover:text-primary border border-border px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {targetMode === 'SPECIFIC' && (
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Target Guard Officer</label>
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
        )}

        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Signal Title</label>
          <input 
            type="text" 
            name="title" 
            required 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Signal title (e.g. 'Urgent Check-in Required')" 
            className="w-full px-3.5 py-2.5 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all" 
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Message Details</label>
          <textarea 
            name="message" 
            required 
            rows={3} 
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="Enter instruction or dispatch details..." 
            className="w-full px-3.5 py-2.5 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all resize-none" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Dispatching Signal...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white/30" />
              <span>{targetMode === 'BROADCAST' ? '⚡ Broadcast to All Guards' : '⚡ Dispatch Signal Now'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import CheckInCameraModal from './CheckInCameraModal'
import { 
  Clock, 
  CheckCircle2, 
  Bell, 
  ShieldAlert, 
  Camera, 
  MapPin, 
  Calendar,
  AlertCircle,
  Radio
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function GuardDashboardClient({
  schedules,
  unreadCount: initialUnread,
  guardId,
}: {
  schedules: any[]
  unreadCount: number
  guardId: string
}) {
  const [localSchedules, setLocalSchedules] = useState(schedules)
  const [unread, setUnread] = useState(initialUnread)
  const [newNotif, setNewNotif] = useState<string | null>(null)
  const [activeCheckInId, setActiveCheckInId] = useState<string | null>(null)

  useEffect(() => {
    setLocalSchedules(schedules)
  }, [schedules])

  useEffect(() => {
    // Subscribe to real-time notifications for this guard
    const channel = supabase
      .channel(`notifications:${guardId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guard_notifications',
          filter: `guard_id=eq.${guardId}`,
        },
        (payload) => {
          const notif = payload.new as any
          setNewNotif(`📢 ${notif.title}: ${notif.message}`)
          setUnread(prev => prev + 1)
          setTimeout(() => setNewNotif(null), 8000)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [guardId])

  function handleCheckInSuccess(scheduleId: string) {
    setLocalSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, is_completed: true } : s))
  }

  const now = new Date()
  const pendingCount = localSchedules.filter(s => !s.is_completed).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      {activeCheckInId && (
        <CheckInCameraModal
          scheduleId={activeCheckInId}
          onClose={() => setActiveCheckInId(null)}
          onSuccess={handleCheckInSuccess}
        />
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Today's Shift Duties</h1>
          <p suppressHydrationWarning className="text-xs sm:text-sm font-medium text-muted-foreground mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {pendingCount} Tasks Due
          </span>
        </div>
      </div>

      {/* Realtime Notification Toast */}
      {newNotif && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-extrabold flex items-center gap-3 animate-pulse shadow-md">
          <Radio className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{newNotif}</span>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-3xl p-5 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Shift Tasks</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{localSchedules.length}</div>
          <span className="text-[11px] text-muted-foreground mt-1 block">Scheduled for today</span>
        </div>

        <Link href="/guard/notifications" className="block">
          <div className={`glass-card rounded-3xl p-5 border transition-all ${unread > 0 ? 'border-amber-500/40 bg-amber-500/5' : 'border-border'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${unread > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                Unread Signals
              </span>
              <div className={`p-2 rounded-xl ${unread > 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-3xl font-black ${unread > 0 ? 'text-amber-500 animate-pulse' : 'text-foreground'}`}>
              {unread}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">Supervisor pings</span>
          </div>
        </Link>
      </div>

      {/* Schedule Items List */}
      <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="text-base font-extrabold text-foreground">Scheduled Duties & Check-ins</h2>
          <span className="text-xs font-bold text-muted-foreground bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full border border-border">
            {localSchedules.length} Items
          </span>
        </div>

        <div className="space-y-3">
          {localSchedules.map(s => {
            const isDone = s.is_completed
            return (
              <div 
                key={s.id} 
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isDone 
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-75' 
                    : 'bg-black/5 dark:bg-white/5 border-border hover:border-primary/40'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-foreground">{s.task_type.replace('_', ' ')}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      isDone 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {isDone ? 'COMPLETED' : 'DUE NOW'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono font-bold text-foreground">
                      {new Date(s.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {(s.sites?.name || (s.sites && (s.sites as any).name)) && (
                      <span className="flex items-center gap-1">
                        • <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {(s.sites as any).name}
                      </span>
                    )}
                  </div>
                </div>

                {isDone ? (
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Done</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveCheckInId(s.id)}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Check In</span>
                  </button>
                )}
              </div>
            )
          })}

          {localSchedules.length === 0 && (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-foreground">No Duties Scheduled for Today</p>
              <p className="text-xs text-muted-foreground">All operational tasks are currently up to date.</p>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Alert CTA Banner */}
      <div className="glass-card rounded-3xl p-6 border border-red-500/30 bg-red-500/5 text-center space-y-3">
        <div className="p-3 rounded-full bg-red-500/10 text-red-500 w-fit mx-auto">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-red-600 dark:text-red-400">Emergency Security Incident?</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            Dispatch an instant high-priority SOS alert directly to your field supervisor.
          </p>
        </div>
        <Link
          href="/guard/alerts"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-extrabold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <span>🚨 Raise Emergency Alert</span>
        </Link>
      </div>
    </div>
  )
}

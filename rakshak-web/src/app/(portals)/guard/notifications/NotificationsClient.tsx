'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { markNotificationRead } from '@/app/actions/ops'
import { Bell, MailCheck, MailWarning, Radio, Check } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NotificationsClient({ notifications: initial, guardId }: { notifications: any[], guardId: string }) {
  const [notifications, setNotifications] = useState(initial)

  useEffect(() => {
    const channel = supabase
      .channel(`notifs-list:${guardId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guard_notifications', filter: `guard_id=eq.${guardId}` },
        (payload) => {
          setNotifications(prev => [payload.new as any, ...prev])
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [guardId])

  async function handleMarkRead(id: string) {
    await markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Signal Notifications</h1>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
            Real-time Operational pings, safety check calls, and supervisor dispatches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold border ${
            unreadCount > 0 
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' 
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          }`}>
            {unreadCount} Unread Signals
          </span>
        </div>
      </div>

      {/* Notifications Stream Card */}
      <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-base font-extrabold text-foreground">Dispatched Signals Log</h2>
          </div>
          <span className="text-xs font-bold text-muted-foreground bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full border border-border">
            {notifications.length} Total
          </span>
        </div>

        <div className="space-y-3">
          {notifications.map(n => (
            <div 
              key={n.id} 
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                n.is_read 
                  ? 'bg-black/5 dark:bg-white/5 border-border/80 opacity-70' 
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-foreground">{n.title}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                    n.is_read 
                      ? 'bg-slate-500/10 text-slate-500' 
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    {n.is_read ? 'READ' : 'NEW SIGNAL'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                <div className="text-[10px] font-mono text-slate-400 pt-1">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>

              {!n.is_read && (
                <button 
                  onClick={() => handleMarkRead(n.id)} 
                  className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer self-start sm:self-center"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-foreground">No Notifications Received</p>
              <p className="text-xs text-muted-foreground">Operational pings from your supervisor will appear here in real-time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

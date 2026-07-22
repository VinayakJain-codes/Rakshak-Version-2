'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGuard } from '@/app/actions/auth'
import { UserPlus, Lock, Mail, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AddGuardForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      await createGuard(new FormData(e.currentTarget))
      setMessage('Guard account registered successfully!')
      router.refresh()
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) {
      setError(err.message || 'Failed to create guard account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-7 border border-border space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-foreground">Register New Guard</h2>
          <p className="text-xs text-muted-foreground">Provision login credentials for security personnel</p>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              name="fullName" 
              required 
              className="w-full pl-9 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all" 
              placeholder="e.g. John Officer" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="email" 
              name="email" 
              required 
              className="w-full pl-9 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all" 
              placeholder="guard@agency.com" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Temporary Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="password" 
              name="password" 
              required 
              minLength={6} 
              className="w-full pl-9 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all" 
              placeholder="Min 6 characters" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Guard Account...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Create Guard Account</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

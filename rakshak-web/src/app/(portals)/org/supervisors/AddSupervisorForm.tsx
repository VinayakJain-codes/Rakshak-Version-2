'use client'

import { useState } from 'react'
import { createSupervisor } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

export default function AddSupervisorForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [generatedPassword, setGeneratedPassword] = useState('')
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const res = await createSupervisor(formData)
      if (res.success && res.generatedPassword) {
        setGeneratedPassword(res.generatedPassword)
        setMessage('Supervisor successfully created!')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-border/50">
      <h2 className="text-xl font-bold mb-6 text-foreground tracking-tight">Create New Supervisor</h2>
      
      {message && <div className="mb-4 p-3 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">{error}</div>}

      <form action={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Supervisor Full Name</label>
          <input type="text" name="fullName" required className="w-full px-3 py-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Supervisor Email</label>
          <input type="email" name="email" required className="w-full px-3 py-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground transition-all" />
        </div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Supervisor'}
        </button>
      </form>

      {generatedPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-border/50 shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-foreground mb-2">Supervisor Created!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Please save this auto-generated temporary password and share it securely with the supervisor. 
              <strong className="text-red-400 block mt-1">It will not be shown again.</strong>
            </p>
            
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-between mb-6">
              <code className="text-lg font-mono font-bold tracking-wider text-foreground select-all">{generatedPassword}</code>
              <button 
                onClick={() => navigator.clipboard.writeText(generatedPassword)}
                className="text-xs bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                Copy
              </button>
            </div>
            
            <button 
              onClick={() => {
                setGeneratedPassword('')
                setMessage('')
              }}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              I have saved the password
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

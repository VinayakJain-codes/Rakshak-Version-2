'use client'

import { useState } from 'react'
import { createSite } from '@/app/actions/org'

export default function AddSiteForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage('')
    setError('')
    try {
      await createSite(formData)
      setMessage('Site successfully created!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-border/50">
      <h2 className="text-xl font-bold mb-6 text-foreground tracking-tight">Create New Site</h2>
      
      {message && <div className="mb-4 p-3 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">{error}</div>}

      <form action={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Site Name</label>
          <input type="text" name="name" required className="w-full px-3 py-2 border border-border bg-surface text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g. Downtown Mall" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Address</label>
          <textarea name="address" required rows={3} className="w-full px-3 py-2 border border-border bg-surface text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none" placeholder="Full address" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Site Image (Optional)</label>
          <input type="file" name="image" accept="image/*" className="w-full px-3 py-2 border border-border bg-surface text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
          <p className="text-xs text-muted-foreground mt-1">If no image is provided, a random place image will be used.</p>
        </div>
        
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Site'}
        </button>
      </form>
    </div>
  )
}

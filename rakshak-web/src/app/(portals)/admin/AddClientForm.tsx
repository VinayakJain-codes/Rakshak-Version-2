'use client'

import { useState } from 'react'
import { createTenantAndClientOwner } from '@/app/actions/auth'

export default function AddClientForm() {
 const [loading, setLoading] = useState(false)
 const [message, setMessage] = useState('')
 const [error, setError] = useState('')

 async function handleSubmit(formData: FormData) {
 setLoading(true)
 setMessage('')
 setError('')
 try {
 await createTenantAndClientOwner(formData)
 setMessage('Tenant and Client Owner successfully created!')
 } catch (err: any) {
 setError(err.message)
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="bg-background p-6 rounded-2xl shadow-sm border border-border/50">
 <h2 className="text-xl font-semibold mb-6">Create New Tenant & Client Owner</h2>
 
 {message && <div className="mb-4 p-3 bg-accent/10 text-accent rounded-lg border border-accent/20">{message}</div>}
 {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">{error}</div>}

 <form action={handleSubmit} className="space-y-4 max-w-xl">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-1">Tenant Name</label>
 <input type="text" name="tenantName" required className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-accent focus:border-accent text-foreground transition-colors" />
 </div>
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-1">Owner Email</label>
 <input type="email" name="email" required className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-accent focus:border-accent text-foreground transition-colors" />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-1">Owner Full Name</label>
 <input type="text" name="fullName" required className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-accent focus:border-accent text-foreground transition-colors" />
 </div>
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-1">Owner Password</label>
 <input type="password" name="password" required minLength={6} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-accent focus:border-accent text-foreground transition-colors" />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-1">Guard Capacity</label>
 <input type="number" name="guardCapacity" defaultValue={10} required className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-accent focus:border-accent text-foreground transition-colors" />
 </div>
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-1">Site Capacity</label>
 <input type="number" name="siteCapacity" defaultValue={5} required className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-accent focus:border-accent text-foreground transition-colors" />
 </div>
 </div>
 
 <button type="submit" disabled={loading} className="w-full mt-4 px-4 py-2.5 bg-primary text-on-primary hover:bg-primary/90 transition-colors rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:opacity-50 border border-white/10">
 {loading ? 'Creating...' : 'Create Tenant'}
 </button>
 </form>
 </div>
 )
}

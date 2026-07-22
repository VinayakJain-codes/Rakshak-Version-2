'use client'

import { useState } from 'react'
import { updateSite, deleteSite } from '@/app/actions/site-mgmt'
import { MoreVertical, MapPin, Calendar, Edit2, Trash2 } from 'lucide-react'

export default function SiteCard({ site }: { site: any }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modal, setModal] = useState<'NONE' | 'EDIT' | 'DELETE'>('NONE')
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState(site.name)
  const [address, setAddress] = useState(site.address)

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await updateSite(site.id, name, address)
      setModal('NONE')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      await deleteSite(site.id)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="group glass-card rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 border border-border/50 relative">
        
        {/* Action Menu Trigger */}
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in-up origin-top-right">
              <button 
                onClick={() => { setModal('EDIT'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-surface transition-colors"
              >
                <Edit2 className="w-4 h-4 text-blue-500" /> Edit Site
              </button>
              <button 
                onClick={() => { setModal('DELETE'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface transition-colors border-t border-border/50 text-red-500 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" /> Delete Site
              </button>
            </div>
          )}
        </div>

        <div className="h-40 w-full bg-surface-opaque relative overflow-hidden flex items-end">
          {site.image_url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={site.image_url} 
                alt={site.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 absolute inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-surface to-surface-opaque" />
          )}
          <h3 className={`relative z-10 p-5 ${site.image_url ? 'text-white drop-shadow-md' : 'text-foreground'} font-bold text-xl leading-tight tracking-tight truncate pr-16`}>
            {site.name}
          </h3>
        </div>
        <div className="p-5 space-y-3 bg-surface/80 backdrop-blur-md h-full">
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary/70" />
            <p className="text-sm leading-relaxed">{site.address}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium pt-2 border-t border-border/50">
            <Calendar className="w-3.5 h-3.5" />
            <span suppressHydrationWarning>Added {new Date(site.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {modal === 'EDIT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4 text-foreground">Edit Site</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Site Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                  className="w-full px-3 py-2 border border-border bg-surface text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required 
                  rows={3}
                  className="w-full px-3 py-2 border border-border bg-surface text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none" 
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModal('NONE')} className="px-4 py-2 text-muted-foreground hover:text-foreground">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modal === 'DELETE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Delete {site.name}?</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              This action cannot be undone. This will also remove any supervisors and schedules assigned to this site.
            </p>
            <div className="flex gap-3 justify-center">
              <button type="button" onClick={() => setModal('NONE')} className="px-4 py-2 text-muted-foreground hover:bg-surface rounded-lg transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={loading} className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50">
                {loading ? 'Deleting...' : 'Yes, delete site'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { updateSupervisorSites } from '@/app/actions/org'
import { useRouter } from 'next/navigation'

export default function AssignSupervisorForm({ supervisors, sites }: { supervisors: any[], sites: any[] }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('')
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([])
  const router = useRouter()

  // When supervisor changes, load their current sites
  useEffect(() => {
    if (selectedSupervisorId) {
      const sup = supervisors.find(s => s.id === selectedSupervisorId)
      if (sup && sup.supervisor_sites) {
        const currentSiteIds = sup.supervisor_sites.map((ss: any) => ss.site_id)
        setSelectedSiteIds(currentSiteIds)
      } else {
        setSelectedSiteIds([])
      }
    } else {
      setSelectedSiteIds([])
    }
  }, [selectedSupervisorId, supervisors])

  const toggleSite = (siteId: string) => {
    setSelectedSiteIds(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    )
  }

  async function handleSave() {
    if (!selectedSupervisorId) return

    setLoading(true)
    setMessage('')
    setError('')
    try {
      await updateSupervisorSites(selectedSupervisorId, selectedSiteIds)
      setMessage('Sites updated successfully!')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-border/50">
      <h2 className="text-xl font-bold mb-6 text-foreground tracking-tight">Assign Sites</h2>
      
      {message && <div className="mb-4 p-3 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">{error}</div>}

      <div className="space-y-6 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Select Supervisor</label>
          <select 
            value={selectedSupervisorId}
            onChange={(e) => {
              setSelectedSupervisorId(e.target.value)
              setMessage('')
              setError('')
            }}
            className="w-full px-3 py-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            <option value="">-- Choose Supervisor --</option>
            {supervisors.map(s => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
        </div>

        {selectedSupervisorId && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-foreground mb-3">Accessible Sites</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {sites.map(site => {
                const isSelected = selectedSiteIds.includes(site.id)
                return (
                  <label 
                    key={site.id} 
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-primary/10 border-primary/30 shadow-sm' 
                        : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSite(site.id)}
                      className="mt-1 shrink-0 rounded text-primary focus:ring-primary border-black/20 dark:border-white/20"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">{site.name}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">{site.address}</span>
                    </div>
                  </label>
                )
              })}
              {sites.length === 0 && (
                <div className="col-span-full p-4 text-center text-sm text-muted-foreground bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-black/20 dark:border-white/20">
                  No sites available in your organization.
                </div>
              )}
            </div>
            
            <button 
              onClick={handleSave} 
              disabled={loading} 
              className="mt-6 w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md shadow-primary/20"
            >
              {loading ? 'Saving Changes...' : 'Save Site Assignments'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

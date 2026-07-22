'use client'

import { useState } from 'react'
import { toggleSupervisorStatus, changeSupervisorPassword, sendSupervisorMessage } from '@/app/actions/supervisor-mgmt'
import { MoreVertical, ShieldAlert, KeyRound, MessageSquare, Ban, CheckCircle2 } from 'lucide-react'

export default function SupervisorCard({ supervisor }: { supervisor: any }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modal, setModal] = useState<'NONE' | 'PASSWORD' | 'MESSAGE'>('NONE')
  const [loading, setLoading] = useState(false)
  
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'INFO' | 'ALERT'>('INFO')

  const isActive = supervisor.is_active ?? true

  async function handleToggleStatus() {
    setLoading(true)
    try {
      await toggleSupervisorStatus(supervisor.id, !isActive)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
      setMenuOpen(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await changeSupervisorPassword(supervisor.id, password)
      alert('Password changed successfully!')
      setModal('NONE')
      setPassword('')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await sendSupervisorMessage(supervisor.id, message, messageType)
      alert('Message sent successfully!')
      setModal('NONE')
      setMessage('')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={`glass-card rounded-3xl p-6 relative group transition-all duration-300 hover:shadow-xl ${!isActive ? 'opacity-75 grayscale-[0.5]' : ''}`}>
        
        {/* Status Badge & Actions */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
              {isActive ? 'Active' : 'Suspended'}
            </span>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-surface rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up origin-top-right">
                <button 
                  onClick={() => { setModal('MESSAGE'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-blue-500" /> Send Message
                </button>
                <button 
                  onClick={() => { setModal('PASSWORD'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-t border-border/50"
                >
                  <KeyRound className="w-4 h-4 text-amber-500" /> Change Password
                </button>
                <button 
                  onClick={handleToggleStatus}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-t border-border/50 text-red-500 hover:text-red-400"
                >
                  {isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />} 
                  {isActive ? 'Suspend User' : 'Reactivate User'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Supervisor Info */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground tracking-tight">{supervisor.full_name}</h3>
          <p className="text-sm text-muted-foreground mt-1 font-mono">{supervisor.id.split('-')[0]}...</p>
        </div>

        {/* Assigned Sites */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Assigned Sites</h4>
          {supervisor.supervisor_sites && supervisor.supervisor_sites.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {supervisor.supervisor_sites.map((ss: any, idx: number) => (
                <span key={idx} className="bg-primary/5 border border-primary/20 text-foreground px-3 py-1.5 rounded-lg text-xs font-medium">
                  {ss.sites?.name}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic bg-surface/50 p-3 rounded-lg border border-dashed border-border text-center">
              No sites assigned
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {modal === 'PASSWORD' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card border border-border/50 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4 text-foreground">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  minLength={6}
                  className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground" 
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModal('NONE')} className="px-4 py-2 text-muted-foreground hover:text-foreground">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {modal === 'MESSAGE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card border border-border/50 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" /> Send Message
            </h3>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                <select 
                  value={messageType} 
                  onChange={(e) => setMessageType(e.target.value as 'INFO' | 'ALERT')}
                  className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="INFO">Information</option>
                  <option value="ALERT">Urgent Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required 
                  rows={4}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary resize-none transition-all placeholder:text-muted-foreground" 
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModal('NONE')} className="px-4 py-2 text-muted-foreground hover:text-foreground">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

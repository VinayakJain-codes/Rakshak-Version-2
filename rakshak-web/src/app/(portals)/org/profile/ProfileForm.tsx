'use client'

import { useState } from 'react'
import { updateProfileDetails, updateUserPassword } from '@/app/actions/profile-mgmt'
import { User, KeyRound, Camera, ShieldCheck, Mail, Building2, CheckCircle2, Lock } from 'lucide-react'

interface ProfileFormProps {
  initialProfile: {
    fullName: string
    avatarUrl: string | null
    email: string
    role: string
    tenantName: string
    createdAt: string
  }
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialProfile.fullName)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatarUrl)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile.avatarUrl)
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordErr, setPasswordErr] = useState('')

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg('')
    setProfileErr('')

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const res = await updateProfileDetails(formData)
      if (res.avatarUrl) {
        setAvatarUrl(res.avatarUrl)
      }
      setProfileMsg('Profile updated successfully!')
    } catch (err: any) {
      setProfileErr(err.message)
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg('')
    setPasswordErr('')

    if (password !== confirmPassword) {
      setPasswordErr('Passwords do not match.')
      return
    }

    setPasswordLoading(true)
    try {
      await updateUserPassword(password)
      setPasswordMsg('Password changed successfully!')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPasswordErr(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Overview Card */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-card rounded-3xl p-6 text-center border border-border/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20" />
          
          <div className="relative pt-6 mb-4">
            <div className="relative w-24 h-24 mx-auto mb-3">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={avatarPreview} 
                  alt={fullName} 
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/30 shadow-xl mx-auto"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-extrabold text-3xl shadow-xl ring-4 ring-emerald-500/20 mx-auto">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
            <span className="inline-block mt-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
              {initialProfile.role}
            </span>
          </div>

          <div className="space-y-3 pt-4 border-t border-border/50 text-left text-xs">
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-xl bg-surface/50">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{initialProfile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-xl bg-surface/50">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{initialProfile.tenantName}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-xl bg-surface/50">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Joined {new Date(initialProfile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Settings Forms */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Personal Details & Avatar Form */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Personal Details</h3>
              <p className="text-xs text-muted-foreground">Update your display name and profile picture.</p>
            </div>
          </div>

          {profileMsg && (
            <div className="mb-6 p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {profileMsg}
            </div>
          )}
          {profileErr && (
            <div className="mb-6 p-3.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 text-xs font-semibold">
              {profileErr}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">Display Full Name</label>
              <input 
                type="text" 
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">Upload Profile Photo</label>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full text-xs text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-2"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">PNG, JPG, or GIF up to 5MB.</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={profileLoading}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {profileLoading ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Security & Password</h3>
              <p className="text-xs text-muted-foreground">Update your login password securely.</p>
            </div>
          </div>

          {passwordMsg && (
            <div className="mb-6 p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {passwordMsg}
            </div>
          )}
          {passwordErr && (
            <div className="mb-6 p-3.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 text-xs font-semibold">
              {passwordErr}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">New Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={passwordLoading}
                className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}

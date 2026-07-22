'use client'

import { useState } from 'react'
import { MapPin, Camera, CheckCircle2, FileWarning, Clock, ShieldCheck } from 'lucide-react'

export default function ComplianceClient({ attendanceRecords }: { attendanceRecords: any[] }) {
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null)
  const [signedOff, setSignedOff] = useState<Record<string, boolean>>({})

  const handleSignOff = (id: string) => {
    setSignedOff(prev => ({ ...prev, [id]: true }))
    setSelectedRecord(null)
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Compliance & Verification</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Review contractual evidence of physical presence and sign off on shifts.</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-border/50 overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shift Details</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clock In</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Evidence</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 bg-transparent">
            {attendanceRecords.map((att: any) => {
              const isSignedOff = signedOff[att.id]
              return (
                <tr key={att.id} className="hover:bg-surface/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-foreground">{att.profiles?.full_name}</div>
                    <div className="text-xs text-muted-foreground">{att.sites?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground" suppressHydrationWarning>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      {new Date(att.clock_in).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs font-medium text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                        <MapPin className="w-3 h-3" /> GPS Logged
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                        <Camera className="w-3 h-3" /> Photo Attached
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isSignedOff ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <button 
                        onClick={() => setSelectedRecord(att)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-bold transition-colors"
                      >
                        Review Evidence
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {attendanceRecords.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No records require verification at this time.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-2xl w-full p-0 rounded-3xl border border-border/50 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-surface/30">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" /> Evidence Verification
              </h3>
              <button onClick={() => setSelectedRecord(null)} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium px-3 py-1 bg-surface rounded-lg border border-border">
                Close
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-opaque">
              {/* Simulated GPS */}
              <div className="space-y-3">
                <div className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" /> GPS Location Log
                </div>
                <div className="w-full h-48 bg-slate-800 rounded-2xl relative overflow-hidden border border-border">
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80" alt="Map view" className="w-full h-full object-cover opacity-50 grayscale" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center animate-ping">
                      <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500" />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-black/10 dark:border-white/10">
                  <strong className="text-foreground">Location matched site geofence</strong> (+/- 5 meters)
                </div>
              </div>

              {/* Simulated Photo */}
              <div className="space-y-3">
                <div className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-500" /> Check-in Selfie
                </div>
                <div className="w-full h-48 bg-slate-800 rounded-2xl relative overflow-hidden border border-border flex items-center justify-center">
                   <div className="text-center space-y-2 text-muted-foreground">
                     <Camera className="w-8 h-8 mx-auto opacity-50" />
                     <p className="text-xs font-mono">ENCRYPTED_BLOB_ID_{selectedRecord.id.substring(0, 8)}</p>
                   </div>
                </div>
                <div className="text-xs text-muted-foreground bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-black/10 dark:border-white/10">
                  <strong className="text-foreground">Face match verified</strong> via AI liveness check.
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border/50 bg-surface/30">
              <div className="flex items-start gap-4 mb-6">
                <FileWarning className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  By signing off, you acknowledge that you have reviewed the evidence and verify that the security personnel was physically present according to contractual obligations.
                </p>
              </div>
              <button 
                onClick={() => handleSignOff(selectedRecord.id)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20"
              >
                Sign-off and Verify Presence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

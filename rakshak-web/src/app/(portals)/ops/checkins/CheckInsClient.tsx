'use client'

import React, { useState } from 'react'
import { 
  Camera, 
  CheckCircle2, 
  XCircle, 
  Search, 
  MapPin, 
  Clock, 
  User, 
  ShieldCheck, 
  Eye, 
  AlertTriangle,
  SlidersHorizontal,
  X,
  ExternalLink
} from 'lucide-react'

interface CheckinItem {
  id: string
  photo_url: string
  signed_url?: string
  verification_result: string
  verification_score: number | null
  model_version: string | null
  failure_reason: string | null
  created_at: string
  guard_name: string
  site_name: string
  task_type: string
}

export default function CheckInsClient({ checkins }: { checkins: CheckinItem[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL')
  const [selectedCheckin, setSelectedCheckin] = useState<CheckinItem | null>(null)

  const filtered = checkins.filter(item => {
    const matchesSearch = 
      item.guard_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.task_type.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (statusFilter === 'ALL') return matchesSearch
    return matchesSearch && item.verification_result === statusFilter
  })

  const totalCount = checkins.length
  const passCount = checkins.filter(c => c.verification_result === 'PASS').length
  const failCount = checkins.filter(c => c.verification_result === 'FAIL').length
  const passRate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 100

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Camera className="w-6 h-6" />
            </div>
            Guard Check-In Photo Audits
          </h1>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
            Real-time biometric & computer vision audit log of guard camera check-ins.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="glass-card rounded-3xl p-5 border border-border flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Total Check-Ins</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{totalCount}</h3>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-border flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">AI Verified Rate</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{passRate}%</h3>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-border flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Flagged / Rejected</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{failCount}</h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card rounded-3xl p-4 border border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search guard or site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-2xl bg-surface/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground mr-1 shrink-0" />
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              statusFilter === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('PASS')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              statusFilter === 'PASS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            Verified PASS ({passCount})
          </button>
          <button
            onClick={() => setStatusFilter('FAIL')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              statusFilter === 'FAIL'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            Flagged FAIL ({failCount})
          </button>
        </div>
      </div>

      {/* Grid of Check-In Records */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const isPass = item.verification_result === 'PASS'
            return (
              <div 
                key={item.id} 
                className="glass-card rounded-3xl overflow-hidden border border-border group hover:border-primary/50 transition-all duration-300 flex flex-col"
              >
                {/* Photo Preview Container */}
                <div 
                  onClick={() => setSelectedCheckin(item)}
                  className="relative aspect-video w-full bg-black/90 overflow-hidden cursor-pointer group-hover:opacity-95 transition-opacity"
                >
                  {item.signed_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={item.signed_url} 
                      alt={item.guard_name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                      <Camera className="w-8 h-8 mb-2 text-slate-500" />
                      <span className="text-xs font-medium">Photo evidence stored</span>
                    </div>
                  )}

                  {/* Top Result Pill */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-md backdrop-blur-md ${
                      isPass 
                        ? 'bg-emerald-500/90 text-white border border-emerald-400/40' 
                        : 'bg-rose-500/90 text-white border border-rose-400/40'
                    }`}>
                      {isPass ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {isPass ? `PASS ${item.verification_score ? `(${item.verification_score}%)` : ''}` : 'REJECTED'}
                    </span>

                    <span className="bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-md border border-white/10">
                      {item.task_type}
                    </span>
                  </div>

                  {/* Zoom Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-1.5 rounded-xl bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/30 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> Inspect Photo
                    </span>
                  </div>
                </div>

                {/* Content Footer */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                        <User className="w-4 h-4 text-primary shrink-0" />
                        {item.guard_name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{item.site_name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(item.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>

                    {item.failure_reason && (
                      <p className="text-xs text-rose-500 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-xl font-medium border border-rose-500/20 mt-2">
                        ⚠️ {item.failure_reason}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedCheckin(item)}
                    className="w-full py-2 px-3 rounded-xl bg-surface hover:bg-surface/80 border border-border text-xs font-extrabold text-foreground transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" /> View Verification Details
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center border border-border">
          <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-foreground">No Check-In Records Found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            No guard photo check-ins match your selected search or filter criteria.
          </p>
        </div>
      )}

      {/* High-Resolution Inspection Modal */}
      {selectedCheckin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl border border-border w-full max-w-3xl overflow-hidden bg-background max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Photo Check-In Audit</h3>
                  <p className="text-xs text-muted-foreground">{selectedCheckin.guard_name} @ {selectedCheckin.site_name}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCheckin(null)}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo */}
                <div className="aspect-square w-full rounded-2xl bg-black overflow-hidden relative border border-border shadow-md">
                  {selectedCheckin.signed_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={selectedCheckin.signed_url} 
                      alt="Uploaded check-in proof" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Camera className="w-12 h-12 mb-2 text-slate-500" />
                      <span className="text-xs">No image preview available</span>
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] font-mono px-2.5 py-1 rounded-md border border-white/10">
                    Uploaded Proof Photo
                  </span>
                </div>

                {/* AI Verification Telemetry */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider">AI Computer Vision Telemetry</h4>
                    
                    <div className="p-4 rounded-2xl bg-surface/50 border border-border space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-semibold">Verification Verdict:</span>
                        <span className={`font-black px-2.5 py-0.5 rounded-full ${
                          selectedCheckin.verification_result === 'PASS' 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          {selectedCheckin.verification_result}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-semibold">Confidence Score:</span>
                        <span className="font-mono font-bold text-foreground">
                          {selectedCheckin.verification_score ? `${selectedCheckin.verification_score}%` : 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-semibold">AI Model Engine:</span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {selectedCheckin.model_version || 'Rakshak-CV-v1.0'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider">Check-In Context</h4>
                      
                      <div className="p-4 rounded-2xl bg-surface/50 border border-border space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Guard Officer:</span>
                          <span className="font-bold text-foreground">{selectedCheckin.guard_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duty Site:</span>
                          <span className="font-bold text-foreground">{selectedCheckin.site_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duty Type:</span>
                          <span className="font-bold text-foreground">{selectedCheckin.task_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Timestamp:</span>
                          <span className="font-mono text-foreground">
                            {new Date(selectedCheckin.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedCheckin.failure_reason && (
                      <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
                        <p className="font-bold mb-0.5">Failure Diagnostic Reason:</p>
                        <p>{selectedCheckin.failure_reason}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedCheckin(null)}
                    className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-2xl text-xs hover:bg-primary/90 transition-colors"
                  >
                    Close Audit Window
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

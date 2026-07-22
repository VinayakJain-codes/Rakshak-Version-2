'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  CreditCard, 
  Headset, 
  ArrowUpRight, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Building2, 
  FileText,
  AlertTriangle,
  UserCheck,
  Zap,
  ArrowRight
} from 'lucide-react'

// Widget 4: Supervisors & Roster Brief
export function SupervisorsWidget({ guardsCount = 0, sitesCount = 0 }: { guardsCount?: number, sitesCount?: number }) {
  // Removing coverageRatio as requested

  return (
    <div className="glass-card rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Supervisors & Roster Brief</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Field management and guard allocation status</p>
          </div>
        </div>
        <Link
          href="/org/supervisors"
          className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          Manage Roster <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Assigned Guards</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{guardsCount} Active</div>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">● Positions On Shift</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Supervisor Action</span>
          <Link
            href="/org/supervisors"
            className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-teal-500 transition-colors w-full justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign Supervisor</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Widget 5: Incidents & Live Security Alerts Stream
export function IncidentsAlertsWidget({ openIncidentsCount = 0 }: { openIncidentsCount?: number }) {
  return (
    <div className="glass-card rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Incidents & Security Alerts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time incident response log across properties</p>
          </div>
        </div>
        <Link
          href="/org/reports"
          className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          Full Audit Stream <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {openIncidentsCount > 0 ? (
            <AlertTriangle className="w-6 h-6 text-red-500 animate-bounce" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          )}
          <div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
              {openIncidentsCount > 0 ? `${openIncidentsCount} Open Incidents Require Attention` : 'All Security Perimeter Systems Clear'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {openIncidentsCount > 0 ? 'Review incident reports and supervisor action steps.' : 'Zero critical security breaches logged today.'}
            </p>
          </div>
        </div>

        <Link
          href="/org/reports"
          className="px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-xs hover:opacity-90 transition-opacity shrink-0"
        >
          View Reports
        </Link>
      </div>
    </div>
  )
}

// Widget 6: Compliance & Audit Score Overview
export function ComplianceWidget({ complianceScore = 98 }: { complianceScore?: number }) {
  return (
    <div className="glass-card rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Compliance & Audit Overview</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">SLA performance and guard verification metrics</p>
          </div>
        </div>
        <Link
          href="/org/compliance"
          className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          Compliance Detail <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-500">Guard Check-In Verification</span>
            <span className="text-emerald-600 dark:text-emerald-400">{complianceScore}% Pass Rate</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${complianceScore}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-500">SLA Shift Coverage</span>
            <span className="text-teal-600 dark:text-teal-400">99.2% Target</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full transition-all" style={{ width: '99.2%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Widget 7: Resource Capacity & Billing Tier
export function BillingUsageWidget({ 
  billingTier = 'FREE', 
  guardsCount = 0, 
  sitesCount = 0,
  guardCapacity = 10,
  siteCapacity = 5
}: { 
  billingTier?: string
  guardsCount?: number
  sitesCount?: number
  guardCapacity?: number
  siteCapacity?: number
}) {
  const guardPct = Math.min(100, Math.round((guardsCount / guardCapacity) * 100))
  const sitePct = Math.min(100, Math.round((sitesCount / siteCapacity) * 100))

  return (
    <div className="glass-card rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Tenant Resource Usage & Tier</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active quota capacity and billing plan</p>
          </div>
        </div>
        <Link
          href="/org/billing"
          className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          Upgrade Capacity <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400 uppercase">Guard Capacity</span>
            <span className="text-slate-900 dark:text-white">{guardsCount} / {guardCapacity}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${guardPct}%` }} />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400 uppercase">Site Capacity</span>
            <span className="text-slate-900 dark:text-white">{sitesCount} / {siteCapacity}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full transition-all" style={{ width: `${sitePct}%` }} />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">Current Plan</div>
            <div className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">{billingTier} TIER</div>
          </div>
          <Link
            href="/org/billing"
            className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-500 transition-colors shrink-0"
          >
            Upgrade
          </Link>
        </div>
      </div>
    </div>
  )
}

// Widget 8: Support & Service Desk Brief
export function SupportWidget() {
  return (
    <div className="glass-card rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Headset className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Rakshak Support Desk</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Direct technical & operational support queue</p>
          </div>
        </div>
        <Link
          href="/org/tickets"
          className="text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
        >
          Create Support Ticket <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">24/7 Priority Admin Support Active</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Submit requests for custom site configurations or guard expansions</div>
          </div>
        </div>

        <Link
          href="/org/tickets"
          className="px-3.5 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-amber-500 transition-colors shrink-0"
        >
          Open Ticket
        </Link>
      </div>
    </div>
  )
}

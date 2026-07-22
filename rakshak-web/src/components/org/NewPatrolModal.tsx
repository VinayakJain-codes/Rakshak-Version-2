'use client'

import { useState } from 'react'
import { Plus, X, Building2, UserPlus, FileText, Headset, ShieldAlert, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface NewPatrolModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewPatrolModal({ isOpen, onClose }: NewPatrolModalProps) {
  if (!isOpen) return null

  const actions = [
    {
      title: 'Add New Site',
      description: 'Register a new property or facility for guard monitoring',
      href: '/org/sites',
      icon: Building2,
      color: 'bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-800/40',
    },
    {
      title: 'Assign Supervisor',
      description: 'Link an operational supervisor to manage site security',
      href: '/org/supervisors',
      icon: UserPlus,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800/40',
    },
    {
      title: 'Create Support Ticket',
      description: 'Raise an urgent inquiry or assistance request with Rakshak Admin',
      href: '/org/tickets',
      icon: Headset,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800/40',
    },
    {
      title: 'Generate Compliance Report',
      description: 'Review guard check-ins, logs, and compliance score metrics',
      href: '/org/reports',
      icon: FileText,
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-800/40',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Quick Action Center</h2>
              <p className="text-xs text-muted-foreground">Select an operation to perform for your organization</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 gap-3.5 mt-5">
          {actions.map((act) => {
            const Icon = act.icon
            return (
              <Link
                key={act.title}
                href={act.href}
                onClick={onClose}
                className="group flex items-center justify-between p-4 rounded-2xl border border-border/70 hover:border-primary/40 bg-surface hover:bg-foreground/[0.02] transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl border ${act.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {act.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{act.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

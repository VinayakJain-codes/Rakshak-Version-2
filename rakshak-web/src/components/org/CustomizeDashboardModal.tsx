'use client'

import React from 'react'
import { 
  X, 
  SlidersHorizontal, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Check, 
  Building2, 
  Radio, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  CreditCard, 
  Headset,
  LayoutGrid
} from 'lucide-react'

export interface WidgetConfig {
  id: string
  title: string
  description: string
  category: string
  icon: any
  isVisible: boolean
}

interface CustomizeDashboardModalProps {
  isOpen: boolean
  onClose: () => void
  widgets: WidgetConfig[]
  onToggleVisibility: (id: string) => void
  onMoveWidget: (id: string, direction: 'up' | 'down') => void
  onResetDefaults: () => void
}

export function CustomizeDashboardModal({
  isOpen,
  onClose,
  widgets,
  onToggleVisibility,
  onMoveWidget,
  onResetDefaults,
}: CustomizeDashboardModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-up">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Customize Dashboard Layout
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose which features to display and reorder them to match your workflow.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {widgets.map((widget, index) => {
            const Icon = widget.icon || LayoutGrid
            return (
              <div
                key={widget.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  widget.isVisible
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 shadow-xs'
                    : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    widget.isVisible
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {widget.title}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {widget.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {widget.description}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Move Buttons */}
                  <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
                    <button
                      disabled={index === 0}
                      onClick={() => onMoveWidget(widget.id, 'up')}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === widgets.length - 1}
                      onClick={() => onMoveWidget(widget.id, 'down')}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => onToggleVisibility(widget.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      widget.isVisible
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {widget.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{widget.isVisible ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Apply Layout</span>
          </button>
        </div>
      </div>
    </div>
  )
}

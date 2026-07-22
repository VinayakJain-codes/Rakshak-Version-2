'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, EyeOff, Eye } from 'lucide-react'

interface SortableWidgetProps {
  id: string
  title: string
  description?: string
  isCustomizing: boolean
  isVisible: boolean
  onToggleVisibility: (id: string) => void
  onMoveUp?: (id: string) => void
  onMoveDown?: (id: string) => void
  children: React.ReactNode
}

export function SortableWidget({
  id,
  title,
  description,
  isCustomizing,
  isVisible,
  onToggleVisibility,
  children,
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : isVisible ? 1 : 0.4,
  }

  if (!isVisible && !isCustomizing) {
    return null
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative transition-all duration-200 ${
        isCustomizing
          ? 'p-2 rounded-3xl border-2 border-dashed border-primary/40 bg-primary/[0.02] shadow-sm'
          : ''
      }`}
    >
      {/* Customization Top Handle */}
      {isCustomizing && (
        <div className="flex items-center justify-between px-4 py-2.5 mb-2 bg-surface dark:bg-slate-900 border border-border rounded-2xl shadow-xs z-20">
          <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="w-5 h-5 text-primary" />
            <div>
              <span className="text-xs font-extrabold text-foreground">{title}</span>
              {description && <p className="text-[10px] text-muted-foreground line-clamp-1">{description}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleVisibility(id)}
              className={`p-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                isVisible
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
              }`}
            >
              {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{isVisible ? 'Visible' : 'Hidden'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className={!isVisible && isCustomizing ? 'pointer-events-none opacity-50 filter grayscale-[50%]' : ''}>
        {children}
      </div>
    </div>
  )
}

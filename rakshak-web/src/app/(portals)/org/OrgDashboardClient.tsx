'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  Calendar, 
  ShieldCheck, 
  MapPin, 
  Users, 
  ChevronDown, 
  ArrowUpRight, 
  Radio, 
  Plus, 
  Minus, 
  Sparkles,
  Inbox,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  GripVertical,
  ShieldAlert,
  CreditCard,
  Headset,
  UserCheck
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { NewPatrolModal } from '@/components/org/NewPatrolModal'
import { SortableWidget } from '@/components/org/SortableWidget'
import { CustomizeDashboardModal, WidgetConfig } from '@/components/org/CustomizeDashboardModal'
import { 
  SupervisorsWidget, 
  IncidentsAlertsWidget, 
  ComplianceWidget, 
  BillingUsageWidget, 
  SupportWidget 
} from '@/components/org/OrgDashboardWidgets'

export interface SiteItem {
  id: string
  name: string
  address: string
  status: 'ACTIVE' | 'CRITICAL' | 'PENDING'
  guardsActive: number
  imageUrl?: string
  createdAt?: string
}

export interface SystemAlert {
  id: string
  title: string
  message: string
  created_at: string
}

export interface OrgDashboardClientProps {
  tenantName: string
  billingTier: string
  guardCapacity: number
  siteCapacity: number
  guardsCount: number
  sitesCount: number
  schedulesCount: number
  openIncidentsCount: number
  complianceScore: number
  sites: SiteItem[]
  systemAlerts: SystemAlert[]
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'kpi_metrics',
    title: 'Key Performance Metrics',
    description: 'Summary metrics for active sites, weekly schedules, and compliance score',
    category: 'Core Metrics',
    icon: Building2,
    isVisible: true,
  },
  {
    id: 'managed_locations',
    title: 'Managed Locations Showcase',
    description: 'Real-time property cards with guard counts, status badges, and quick actions',
    category: 'Property Management',
    icon: MapPin,
    isVisible: true,
  },
  {
    id: 'spatial_radar',
    title: 'Spatial Network View',
    description: 'High-tech interactive radar map with real-time site coordinates & nodes',
    category: 'Live Security Radar',
    icon: Radio,
    isVisible: true,
  },
  {
    id: 'supervisors_roster',
    title: 'Supervisors & Roster Brief',
    description: 'Field supervisor assignments, site coverage ratio, and roster controls',
    category: 'Field Operations',
    icon: UserCheck,
    isVisible: true,
  },
  {
    id: 'incidents_alerts',
    title: 'Incidents & Security Stream',
    description: 'Live incident alerts stream, breach warnings, and audit logs',
    category: 'Security Response',
    icon: ShieldAlert,
    isVisible: true,
  },
  {
    id: 'compliance_audit',
    title: 'Compliance & Audit Breakdown',
    description: 'SLA verification, guard check-in completion rates, and inspection scores',
    category: 'Quality & Audit',
    icon: ShieldCheck,
    isVisible: true,
  },
  {
    id: 'billing_usage',
    title: 'Resource Capacity & Billing Tier',
    description: 'Guard and site capacity meters, tenant subscription tier details',
    category: 'Account & Billing',
    icon: CreditCard,
    isVisible: true,
  },
  {
    id: 'support_tickets',
    title: 'Rakshak Service Desk Brief',
    description: 'Active support tickets, priority responses, and open inquiry CTA',
    category: 'Support & Help',
    icon: Headset,
    isVisible: true,
  },
]

function DraggableNode({ children, initialX, initialY, zoomLevel, onClick }: { children: React.ReactNode, initialX: number, initialY: number, zoomLevel: number, onClick: () => void }) {
  const [pos, setPos] = useState({ x: initialX, y: initialY })
  const [isDragging, setIsDragging] = useState(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = pos.x;
    const startPosY = pos.y;
    let dragged = false;

    const handlePointerMove = (ev: PointerEvent) => {
      if (Math.abs(ev.clientX - startX) > 3 || Math.abs(ev.clientY - startY) > 3) {
        dragged = true;
        setIsDragging(true);
      }
      if (dragged) {
        setPos({
          x: startPosX + (ev.clientX - startX) / zoomLevel,
          y: startPosY + (ev.clientY - startY) / zoomLevel
        });
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (!dragged) {
        onClick();
      }
      setTimeout(() => setIsDragging(false), 50);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, touchAction: 'none' }}
      className={`absolute z-20 group ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
      onPointerDown={handlePointerDown}
    >
      {children}
    </div>
  )
}

const STORAGE_KEY = 'rakshak_org_dashboard_layout_v3'

export function OrgDashboardClient({
  tenantName,
  billingTier,
  guardCapacity,
  siteCapacity,
  guardsCount,
  sitesCount,
  schedulesCount,
  openIncidentsCount,
  complianceScore,
  sites,
  systemAlerts,
}: OrgDashboardClientProps) {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'ACTIVE' | 'CRITICAL' | 'PENDING'>('ALL')
  const [dateRange, setDateRange] = useState('Current Period')
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isPatrolModalOpen, setIsPatrolModalOpen] = useState(false)

  // Customization & Drag-and-Drop state
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS)
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Load saved layout from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Array<{ id: string; isVisible: boolean }>
        if (Array.isArray(parsed)) {
          const map = new Map(parsed.map(item => [item.id, item.isVisible]))
          const reordered: WidgetConfig[] = []
          
          // Reconstruct saved order
          parsed.forEach(item => {
            const found = DEFAULT_WIDGETS.find(w => w.id === item.id)
            if (found) {
              reordered.push({ ...found, isVisible: item.isVisible })
            }
          })

          // Append any new widgets missing from saved
          DEFAULT_WIDGETS.forEach(w => {
            if (!reordered.some(item => item.id === w.id)) {
              reordered.push(w)
            }
          })

          if (reordered.length > 0) {
            setWidgets(reordered)
          }
        }
      }
    } catch (e) {
      console.error('Failed to load dashboard layout from localStorage', e)
    }
  }, [])

  // Save layout changes to localStorage
  const saveWidgetsToStorage = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets)
    try {
      const toSave = newWidgets.map(w => ({ id: w.id, isVisible: w.isVisible }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (e) {
      console.error('Failed to save layout to localStorage', e)
    }
  }

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id)
      const newIndex = widgets.findIndex(w => w.id === over.id)
      const updated = arrayMove(widgets, oldIndex, newIndex)
      saveWidgetsToStorage(updated)
    }
  }

  const handleToggleVisibility = (id: string) => {
    const updated = widgets.map(w => (w.id === id ? { ...w, isVisible: !w.isVisible } : w))
    saveWidgetsToStorage(updated)
  }

  const handleMoveWidget = (id: string, direction: 'up' | 'down') => {
    const index = widgets.findIndex(w => w.id === id)
    if (index < 0) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= widgets.length) return

    const updated = arrayMove(widgets, index, targetIndex)
    saveWidgetsToStorage(updated)
  }

  const handleResetDefaults = () => {
    saveWidgetsToStorage(DEFAULT_WIDGETS)
  }

  const filteredSites = sites.filter(site => {
    if (selectedFilter === 'ALL') return true
    return site.status === selectedFilter
  })

  // Render individual widget component by ID
  const renderWidgetContent = (id: string) => {
    switch (id) {
      case 'kpi_metrics':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Active Sites */}
            <div className="group relative glass-card rounded-3xl p-6 transition-all duration-300 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2.5 py-1 rounded-full border border-teal-500/20">
                  Live DB
                </span>
              </div>
              <div className="mt-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  ACTIVE SITES
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
                  {sitesCount}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>

            {/* Card 2: Weekly Schedules */}
            <div className="group relative glass-card rounded-3xl p-6 transition-all duration-300 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {guardsCount} Guards
                </span>
              </div>
              <div className="mt-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  WEEKLY SCHEDULES
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight flex items-baseline gap-2">
                  <span>{schedulesCount}</span>
                  <span className="text-sm font-semibold text-slate-400">active</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>

            {/* Card 3: Compliance Score */}
            <div className="group relative bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white border border-emerald-700/40 rounded-3xl p-6 shadow-xl shadow-emerald-950/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <ShieldCheck className="absolute -right-4 -bottom-4 w-36 h-36 text-white/10 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="p-3 rounded-2xl bg-white/15 text-white backdrop-blur-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center text-[11px] font-bold bg-white/15 text-white backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                  {complianceScore >= 90 ? 'Excellent' : complianceScore >= 75 ? 'Good' : 'Needs Review'}
                </span>
              </div>

              <div className="mt-6 relative z-10">
                <div className="text-xs font-bold text-teal-200/80 uppercase tracking-wider">
                  COMPLIANCE SCORE
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                  {complianceScore}%
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-teal-200/80 relative z-10">
                <span>{openIncidentsCount} Open Incidents</span>
                <Link href="/org/compliance" className="text-white font-bold hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Audit <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )

      case 'managed_locations':
        return (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Managed Locations</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Real-time status of security operations across registered sites</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-xs text-xs font-bold">
                  {(['ALL', 'ACTIVE', 'CRITICAL', 'PENDING'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        selectedFilter === filter
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <Link
                  href="/org/sites"
                  className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold rounded-2xl transition-all shadow-xs hidden sm:inline-flex items-center gap-1 hover:scale-[1.02] active:scale-95"
                >
                  View All Sites
                </Link>
              </div>
            </div>

            {filteredSites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredSites.map((site) => (
                  <div
                    key={site.id}
                    className="group glass-card rounded-3xl p-5 transition-all duration-300 flex flex-col sm:flex-row gap-4 overflow-hidden"
                  >
                    <div className="relative w-full sm:w-36 h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      {site.imageUrl ? (
                        <>
                          <img
                            src={site.imageUrl}
                            alt={site.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent sm:hidden" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-emerald-500/10 via-slate-100 to-slate-200 dark:from-emerald-500/20 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-emerald-500/30 dark:text-emerald-400/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {site.name}
                          </h3>

                          {site.status === 'ACTIVE' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              ACTIVE
                            </span>
                          )}

                          {site.status === 'CRITICAL' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" />
                              CRITICAL
                            </span>
                          )}

                          {site.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              PENDING
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span>{site.address}</span>
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                          <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>{site.guardsActive} Guards Active</span>
                        </div>

                        <Link
                          href="/org/sites"
                          className="font-extrabold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-200"
                        >
                          <span>{site.status === 'CRITICAL' ? 'Manage' : site.status === 'PENDING' ? 'Assign' : 'Details'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Inbox className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Sites Found</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                    {selectedFilter !== 'ALL' 
                      ? `No locations match the "${selectedFilter}" filter criteria.` 
                      : 'Your organization does not have any sites registered yet.'}
                  </p>
                </div>
                <Link
                  href="/org/sites"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-emerald-500 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Site</span>
                </Link>
              </div>
            )}
          </div>
        )

      case 'spatial_radar':
        return (
          <div className="relative bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-teal-500/10 pointer-events-none"
              style={{ transform: `translate(-50%, -50%) scale(${zoomLevel})` }}
            >
              <div className="absolute inset-0 rounded-full border border-teal-500/20 animate-ping opacity-20" />
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-teal-500/15 to-transparent animate-radar" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Spatial Network View</h3>
                  <p className="text-xs text-slate-400">Live spatial overview of all registered monitored sites</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {sites.length > 0 ? `${sites.filter(s => s.status === 'ACTIVE').length}/${sites.length} Active Nodes` : 'System Online'}
                </span>

                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.6))}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div 
              className="relative z-10 h-72 sm:h-80 my-4 flex items-center justify-center transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <DraggableNode initialX={0} initialY={0} zoomLevel={zoomLevel} onClick={() => setSelectedNode(`${tenantName} Central HQ`)}>
                <div className="w-14 h-14 rounded-full bg-emerald-600/30 border-2 border-emerald-400 flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/50">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-emerald-300 bg-slate-900/90 px-2 py-0.5 rounded-md whitespace-nowrap border border-emerald-500/30 pointer-events-none">
                  {tenantName} HQ
                </span>
              </DraggableNode>

              {sites.map((site, index) => {
                const total = sites.length
                const angle = (index / total) * 2 * Math.PI
                const radius = 110
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius

                const isCrit = site.status === 'CRITICAL'
                const isAct = site.status === 'ACTIVE'

                return (
                  <DraggableNode 
                    key={site.id} 
                    initialX={x} 
                    initialY={y} 
                    zoomLevel={zoomLevel} 
                    onClick={() => setSelectedNode(`${site.name} (${site.guardsActive} Guards Active)`)}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full border flex items-center justify-center hover:scale-125 transition-transform shadow-md ${
                        isCrit 
                          ? 'bg-red-500/20 border-red-400 shadow-red-500/30' 
                          : isAct 
                          ? 'bg-emerald-500/20 border-emerald-400 shadow-emerald-500/30' 
                          : 'bg-teal-500/20 border-teal-400 shadow-teal-500/30'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${isCrit ? 'bg-red-400 animate-bounce' : isAct ? 'bg-emerald-400 animate-ping' : 'bg-teal-400'}`} />
                    </div>
                    <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-slate-900/90 px-1.5 py-0.5 rounded-md whitespace-nowrap border border-slate-800 pointer-events-none ${
                      isCrit ? 'text-red-300' : isAct ? 'text-emerald-300' : 'text-teal-300'
                    }`}>
                      {site.name}
                    </span>
                  </DraggableNode>
                )
              })}
            </div>

            {selectedNode && (
              <div className="relative z-10 mt-2 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between text-xs animate-scale-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Selected Node: <strong className="text-white">{selectedNode}</strong></span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white underline text-[11px]"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )

      case 'supervisors_roster':
        return <SupervisorsWidget guardsCount={guardsCount} sitesCount={sitesCount} />

      case 'incidents_alerts':
        return <IncidentsAlertsWidget openIncidentsCount={openIncidentsCount} />

      case 'compliance_audit':
        return <ComplianceWidget complianceScore={complianceScore} />

      case 'billing_usage':
        return (
          <BillingUsageWidget 
            billingTier={billingTier}
            guardsCount={guardsCount}
            sitesCount={sitesCount}
            guardCapacity={guardCapacity}
            siteCapacity={siteCapacity}
          />
        )

      case 'support_tickets':
        return <SupportWidget />

      default:
        return null
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {tenantName} Dashboard
            </h1>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-md border border-blue-500/20">
              {billingTier} TIER
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Overview of your security infrastructure and active operations.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* Customization Toggle Button */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-xs text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isEditMode
                ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500/50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{isEditMode ? 'Exit Reorder Mode' : 'Customize Layout'}</span>
          </button>

          {/* Quick Customization Modal Button */}
          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Manage Features & Widgets"
          >
            <Sparkles className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
          </button>

          {/* Date Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-xs hover:border-blue-500/50 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDatePickerOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-scale-in">
                {['Current Period', 'Last 7 Days', 'Last 30 Days', 'This Month'].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setDateRange(range)
                      setIsDatePickerOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Mode Customization Alert */}
      {isEditMode && (
        <div className="p-4 bg-amber-500/10 border-2 border-dashed border-amber-500/40 rounded-3xl flex items-center justify-between gap-4 animate-scale-in text-xs font-bold text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-amber-500" />
            <div>
              <div>Reorder Mode Active</div>
              <div className="text-[11px] font-normal text-amber-800 dark:text-amber-300">
                Drag handle headers to reorder features, or use the toggle buttons to show/hide widgets.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reset Defaults
            </button>
            <button
              onClick={() => setIsEditMode(false)}
              className="px-4 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Done Reordering
            </button>
          </div>
        </div>
      )}

      {/* DND Drag-and-Drop Widgets Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map(w => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {widgets.map((widget) => {
              const isVisible = widget.isVisible
              if (!isVisible && !isEditMode) return null

              return (
                <SortableWidget
                  key={widget.id}
                  id={widget.id}
                  title={widget.title}
                  description={widget.description}
                  isCustomizing={isEditMode}
                  isVisible={isVisible}
                  onToggleVisibility={handleToggleVisibility}
                  onMoveUp={(id) => handleMoveWidget(id, 'up')}
                  onMoveDown={(id) => handleMoveWidget(id, 'down')}
                >
                  {renderWidgetContent(widget.id)}
                </SortableWidget>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Customize Modal */}
      <CustomizeDashboardModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        widgets={widgets}
        onToggleVisibility={handleToggleVisibility}
        onMoveWidget={handleMoveWidget}
        onResetDefaults={handleResetDefaults}
      />

      {/* Quick Action Modal Trigger */}
      <NewPatrolModal isOpen={isPatrolModalOpen} onClose={() => setIsPatrolModalOpen(false)} />
    </div>
  )
}

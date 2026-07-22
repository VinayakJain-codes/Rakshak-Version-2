'use client'

import { useState } from 'react'
import {
 DndContext,
 DragOverlay,
 closestCorners,
 KeyboardSensor,
 PointerSensor,
 useSensor,
 useSensors,
 DragStartEvent,
 DragOverEvent,
 DragEndEvent,
 useDroppable,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Paperclip, MessageSquare, GripVertical } from 'lucide-react'
import { updateTicketStatus } from '@/app/actions/admin'

type Ticket = any

interface ColumnProps {
 id: string
 title: string
 color: string
 tickets: Ticket[]
}

const SortableTicket = ({ ticket }: { ticket: Ticket }) => {
 const {
 attributes,
 listeners,
 setNodeRef,
 transform,
 transition,
 isDragging,
 } = useSortable({ id: ticket.id })

 const style = {
 transform: CSS.Transform.toString(transform),
 transition,
 opacity: isDragging ? 0.5 : 1,
 }

 return (
 <div
 ref={setNodeRef}
 style={style}
 className="bg-white dark:bg-surface/5 border border-border/60 rounded-xl p-4 hover:border-primary transition-colors cursor-grab active:cursor-grabbing group relative shadow-sm"
 >
 <div 
 {...attributes} 
 {...listeners} 
 className="absolute top-2 right-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
 >
 <GripVertical className="w-4 h-4" />
 </div>
 <div className="flex items-start justify-between gap-2 mb-2 pr-6">
 <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/5 px-2 py-1 rounded-md">{ticket.tenants?.name || 'Unknown Client'}</span>
 <span suppressHydrationWarning className="text-[10px] text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</span>
 </div>
 <h3 className="text-sm font-medium text-foreground mb-1">{ticket.subject}</h3>
 <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{ticket.description}</p>
 
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3 text-muted-foreground">
 <div className="flex items-center gap-1 text-xs">
 <MessageSquare className="w-3.5 h-3.5" />
 <span>0</span>
 </div>
 <div className="flex items-center gap-1 text-xs">
 <Paperclip className="w-3.5 h-3.5" />
 <span>0</span>
 </div>
 </div>
 </div>
 </div>
 )
}

const TicketCardOverlay = ({ ticket }: { ticket: Ticket }) => {
 return (
 <div className="bg-white dark:bg-surface/5 border-2 border-primary/50 rounded-xl p-4 shadow-xl rotate-3 opacity-90">
 <div className="flex items-start justify-between gap-2 mb-2 pr-6">
 <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/5 px-2 py-1 rounded-md">{ticket.tenants?.name || 'Unknown Client'}</span>
 <span suppressHydrationWarning className="text-[10px] text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</span>
 </div>
 <h3 className="text-sm font-medium text-foreground mb-1">{ticket.subject}</h3>
 </div>
 )
}

const DroppableColumn = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className="space-y-3 min-h-[500px]">
      {children}
    </div>
  )
}

export function KanbanBoard({ initialTickets }: { initialTickets: Ticket[] }) {
 const [tickets, setTickets] = useState(initialTickets)
 const [activeId, setActiveId] = useState<string | null>(null)

 const columns = [
 { id: 'OPEN', title: 'Open', color: 'bg-red-500' },
 { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-slate-500' },
 { id: 'RESOLVED', title: 'Resolved', color: 'bg-emerald-500' },
 ]

 const sensors = useSensors(
 useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
 useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
 )

 const handleDragStart = (event: DragStartEvent) => {
 setActiveId(event.active.id as string)
 }

 const handleDragOver = (event: DragOverEvent) => {
 const { active, over } = event
 if (!over) return

 const activeId = active.id
 const overId = over.id

 if (activeId === overId) return

 const activeTicket = tickets.find(t => t.id === activeId)
 const overTicket = tickets.find(t => t.id === overId)
 const isOverColumn = columns.find(c => c.id === overId)

 if (!activeTicket) return

 setTickets(prev => {
 const activeItems = prev.filter(t => t.status === activeTicket.status)
 let overItems: Ticket[] = []
 
 let newStatus = activeTicket.status

 if (overTicket) {
 newStatus = overTicket.status
 overItems = prev.filter(t => t.status === newStatus)
 } else if (isOverColumn) {
 newStatus = isOverColumn.id
 overItems = prev.filter(t => t.status === newStatus)
 }

 if (activeTicket.status === newStatus) {
 return prev
 }

 return prev.map(t => {
 if (t.id === activeId) {
 return { ...t, status: newStatus }
 }
 return t
 })
 })
 }

 const handleDragEnd = async (event: DragEndEvent) => {
 const { active, over } = event
 setActiveId(null)

 if (!over) return

 const activeId = active.id
 const overId = over.id

 const activeTicket = tickets.find(t => t.id === activeId)
 
 if (activeTicket) {
 // Find what column it ended up in
 let finalStatus = activeTicket.status
 if (columns.some(c => c.id === overId)) {
 finalStatus = overId as string
 } else {
 const overTicket = tickets.find(t => t.id === overId)
 if (overTicket) {
 finalStatus = overTicket.status
 }
 }

 // Persist to DB if changed
 const originalTicket = initialTickets.find(t => t.id === activeId)
 if (originalTicket && originalTicket.status !== finalStatus) {
 try {
 await updateTicketStatus(activeId as string, finalStatus)
 } catch (e) {
 console.error("Failed to update status")
 // Revert on error
 setTickets(initialTickets)
 }
 }
 }
 }

 return (
 <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-6 h-full">
 <DndContext
 sensors={sensors}
 collisionDetection={closestCorners}
 onDragStart={handleDragStart}
 onDragOver={handleDragOver}
 onDragEnd={handleDragEnd}
 >
 {columns.map(column => {
 const columnTickets = tickets.filter(t => t.status === column.id)
 return (
 <div key={column.id} className="bg-surface rounded-2xl shadow-xs border border-border flex flex-col min-h-[600px] h-full">
 <div className="p-4 border-b border-border flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
 <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
 </div>
 <div className="bg-[#f4f1ea] dark:bg-surface/10 px-2 py-0.5 rounded text-xs font-medium text-muted-foreground">
 {columnTickets.length}
 </div>
 </div>
 
 <div className="flex-1 p-4 overflow-y-auto">
 <SortableContext id={column.id} items={columnTickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
  <DroppableColumn id={column.id}>
   {columnTickets.map(ticket => (
   <SortableTicket key={ticket.id} ticket={ticket} />
   ))}
   {columnTickets.length === 0 && (
   <div className="h-full flex items-center justify-center py-10 opacity-50">
   <p className="text-sm text-muted-foreground">Drop tickets here</p>
   </div>
   )}
  </DroppableColumn>
 </SortableContext>
 </div>
 </div>
 )
 })}

 <DragOverlay>
 {activeId ? <TicketCardOverlay ticket={tickets.find(t => t.id === activeId)} /> : null}
 </DragOverlay>
 </DndContext>
 </div>
 )
}

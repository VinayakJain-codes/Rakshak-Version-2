import { createClient as createServerClient } from '@/utils/supabase/server'
import { KanbanBoard } from './KanbanBoard'

export default async function AdminTicketsPage() {
 const supabase = await createServerClient()
 const { data: tickets } = await supabase
 .from('support_tickets')
 .select('*, tenants(name)')
 .order('created_at', { ascending: false })

 return (
 <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-6">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground">Global Support Queues</h1>
 <p className="text-sm text-muted-foreground mt-1">Kanban-style ticket management.</p>
 </div>

 <KanbanBoard initialTickets={tickets || []} />
 </div>
 )
}

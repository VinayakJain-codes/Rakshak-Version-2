import { createClient as createServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUserWithRole } from '@/utils/auth-check'

async function submitTicket(formData: FormData) {
  'use server'
  const subject = formData.get('subject') as string
  const description = formData.get('description') as string
  
  const { user, tenantId } = await getUserWithRole()
  if (!user || !tenantId) return

  const supabase = await createServerClient()
  const { error } = await supabase.from('support_tickets').insert({
    tenant_id: tenantId,
    subject,
    description,
    created_by: user.id
  })

  if (error) {
    console.error('Failed to submit ticket:', error)
  }

  revalidatePath('/org/tickets')
}

export default async function OrgTicketsPage() {
  const { tenantId } = await getUserWithRole()
  const supabase = await createServerClient()
  
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Support Tickets</h1>
        <p className="text-muted-foreground text-sm">Contact platform administration for billing or platform-wide issues.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-border/50">
        <h2 className="text-xl font-bold mb-4 text-foreground tracking-tight">Submit a New Ticket</h2>
        <form action={submitTicket} className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
            <input 
              type="text" 
              name="subject" 
              required 
              className="w-full px-3 py-2 border border-border bg-surface text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="E.g., Increase guard capacity"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea 
              name="description" 
              required 
              rows={4}
              className="w-full px-3 py-2 border border-border bg-surface text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none" 
              placeholder="Please provide details about your request..."
            />
          </div>
          <button 
            type="submit" 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Submit Ticket
          </button>
        </form>
      </div>

      <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-surface/50">
          <h2 className="text-lg font-bold text-foreground">Your Previous Tickets</h2>
        </div>
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 bg-transparent">
            {tickets?.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-surface/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  <span suppressHydrationWarning>{new Date(ticket.created_at).toLocaleDateString()}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-foreground">{ticket.subject}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-xs">{ticket.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                    ticket.status === 'OPEN' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                    ticket.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {ticket.status === 'IN_PROGRESS' ? 'IN PROGRESS' : ticket.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!tickets || tickets.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No tickets submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

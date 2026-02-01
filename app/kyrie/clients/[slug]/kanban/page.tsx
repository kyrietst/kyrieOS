import { getKanbanColumns, getKanbanCards } from '@/actions/kanban'
import KanbanBoard from '@/components/kanban/KanbanBoard' // Client component
import { createClient } from '@/utils/supabase/server'

export default async function Page({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  // Need to fetch organization_id using slug. Assuming profiles or direct query? 
  // Wait, clients usually map to organizations.
  // In `app/dashboard/[workspaceSlug]/page.tsx` pattern suggests slug usage.
  // I need to resolve slug to organization_id. 
  // Let's assume there is a way or I query `organizations` by slug if it exists, or `client_organizations`?
  // Checking list_tables earlier... `organizations` table.
  // For now I'll create a helper or query directly.
  
  const { data: org } = await supabase.from('organizations').select('id, name').eq('slug', params.slug).single()
  
  if (!org) return <div>Client not found</div>

  const columns = await getKanbanColumns(org.id)
  const cards = await getKanbanCards(org.id)

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{org.name} › Kanban</h2>
        </div>
        <div>
           {/* Filters */}
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <KanbanBoard initialColumns={columns || []} initialCards={cards || []} organizationId={org.id} />
      </div>
    </div>
  )
}

import { getInboxItems } from '@/actions/inbox'
import InboxList from '@/components/inbox/InboxList'

export default async function Page() {
  const items = await getInboxItems()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inbox Unificado</h2>
          <p className="text-muted-foreground">
            Centralize suas notificações e tarefas pendentes.
          </p>
        </div>
      </div>
      
      <InboxList initialItems={items || []} />
    </div>
  )
}

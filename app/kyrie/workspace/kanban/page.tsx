
import { getKanbanColumns, getKanbanCards } from '@/actions/kanban'
import KanbanBoard from '@/components/kanban/KanbanBoard'

export default async function MasterKanbanPage() {
    // 1. Fetch Global Columns (no org id)
    const columns = await getKanbanColumns()

    // 2. Fetch ALL Cards (no org id = master view)
    const cards = await getKanbanCards(null)

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <KanbanBoard
                    initialColumns={columns || []}
                    initialCards={cards || []}
                    organizationId="master" // Special flag for Master View behavior
                />
            </div>
        </div>
    );
}

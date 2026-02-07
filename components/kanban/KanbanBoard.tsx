'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { createPortal } from 'react-dom'
import { CSS } from '@dnd-kit/utilities'

import KanbanCardModal from './KanbanCardModal'
import KanbanAddList from './KanbanAddList'
import KanbanAddCard from './KanbanAddCard'
import KanbanCard from './KanbanCard'
import { moveCard } from '@/actions/kanban'
import { getUserActiveTimer } from '@/actions/time-tracking'
import { TimeEntry } from '@/types/kanban'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// --- Internal Components for Sortable ---

// --- Internal Components for Sortable ---

function SortableCard({ card, organizationId, onClick, activeTimer, onTimerUpdate }: {
  card: any,
  organizationId: string,
  onClick: () => void,
  activeTimer: TimeEntry | null,
  onTimerUpdate: (t: TimeEntry | null) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    }
  })

  // dnd-kit transform includes scale usually, but for simple lists translate is safer visually often
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  const isMaster = organizationId === 'master'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("touch-none", isDragging && "z-50")} // touch-none for pointer events
    >
      <KanbanCard
        card={card}
        onClick={onClick}
        isMasterView={isMaster}
        activeTimer={activeTimer}
        onTimerUpdate={onTimerUpdate}
      />
    </div>
  )
}

function ColumnContainer({
  column,
  cards,
  organizationId,
  onAddCard,
  activeTimer,
  onTimerUpdate
}: {
  column: any,
  cards: any[],
  organizationId: string,
  onAddCard: (colId: string) => void,
  activeTimer: TimeEntry | null,
  onTimerUpdate: (t: TimeEntry | null) => void
}) {
  const isMaster = organizationId === 'master'
  const columnCards = useMemo(() => cards.filter(c => c.column_id === column.id), [cards, column.id])
  const cardIds = useMemo(() => columnCards.map(c => c.id), [columnCards])

  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column
    }
  })

  return (
    <div
      ref={setNodeRef}
      className="min-w-[300px] w-[300px] flex flex-col h-full rounded-lg bg-muted/50 border border-border/50"
    >
      {/* Header */}
      <div className="p-3 font-semibold flex items-center justify-between border-b border-border/50 bg-muted/50 rounded-t-lg">
        <span>{column.name}</span>
        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
          {columnCards.length}
        </span>
      </div>

      {/* Cards Area */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {columnCards.map(card => (
            <SortableCard
              key={card.id}
              card={card}
              organizationId={organizationId}
              onClick={() => onAddCard(column.id)}
              activeTimer={activeTimer}
              onTimerUpdate={onTimerUpdate}
            />
          ))}
        </SortableContext>
        {/* Placeholder for empty lists to be droppable is handled by Column ref above if logic allows dropping on column */}
      </div>

      {/* Footer / Add Card */}
      <KanbanAddCard
        columnId={column.id}
        organizationId={organizationId}
        isMaster={isMaster}
        columnPosition={column.position}
      />
    </div>
  )
}


export default function KanbanBoard({
  initialColumns,
  initialCards,
  organizationId
}: {
  initialColumns: any[],
  initialCards: any[],
  organizationId: string
}) {
  const [columns] = useState(initialColumns)
  const [cards, setCards] = useState(initialCards)
  const [mounted, setMounted] = useState(false)
  const [activeDragCard, setActiveDragCard] = useState<any>(null)

  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null)

  useEffect(() => {
    setMounted(true)
    getUserActiveTimer().then(setActiveTimer)
  }, [])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeColumnId, setActiveColumnId] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to start drag
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Card') {
      setActiveDragCard(event.active.data.current.card)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Card'
    const isOverTask = over.data.current?.type === 'Card'
    const isOverColumn = over.data.current?.type === 'Column'

    if (!isActiveTask) return

    // Dropping over another Card
    if (isOverTask) {
      setCards(items => {
        const activeIndex = items.findIndex(t => t.id === activeId)
        const overIndex = items.findIndex(t => t.id === overId)

        // If checking same column or different, arrayMove handles index swap
        // But if different column, we need to update column_id first for the active item
        if (items[activeIndex].column_id !== items[overIndex].column_id) {
          const newItems = [...items]
          newItems[activeIndex] = { ...newItems[activeIndex], column_id: items[overIndex].column_id }
          return arrayMove(newItems, activeIndex, overIndex)
        }
        return arrayMove(items, activeIndex, overIndex)
      })
    } else if (isOverColumn) {
      // Dropping over a Column (empty area)
      setCards(items => {
        const activeIndex = items.findIndex(t => t.id === activeId)
        const activeItem = items[activeIndex]

        // Move to that column
        if (activeItem.column_id !== overId) {
          const newItems = [...items]
          newItems[activeIndex] = { ...newItems[activeIndex], column_id: String(overId) }
          // Move to end of that column visually?? 
          // arrayMove expects indices. If we just change column_id, it might jump.
          // For SortableContext, we need the item to remain in the array.
          // Just refreshing the 'items' prop of SortableContext handles it if we update state.
          return newItems
        }
        return items
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragCard(null)

    if (!over) return

    const activeId = active.id as string
    const activeCard = cards.find(c => c.id === activeId)

    if (!activeCard) return

    // Identify where it ended up
    // We already optimistically updated 'cards' in DragOver, so 'activeCard.column_id' 
    // in our state *should* be the new column.
    // However, closure 'cards' here might be stale if we relied on state inside the handler? 
    // No, handler is recreated? No, DndContext needs stable handlers or access to fresh state?
    // DndContext handlers have closure freshness issues sometimes.
    // Let's rely on the `active.data.current` or just re-find in the LATEST cards state?
    // Actually, `cards` in this scope is from the render cycle.

    // We'll perform the Server Action based on the logic of where it is dropped.
    // Simpler: Just look at the `over` target.

    let targetColumnId = activeCard.column_id // Default to where it was
    const isOverTask = over.data.current?.type === 'Card'
    const isOverColumn = over.data.current?.type === 'Column'

    if (isOverTask) {
      const overCard = cards.find(c => c.id === over.id)
      if (overCard) targetColumnId = overCard.column_id
    } else if (isOverColumn) {
      targetColumnId = String(over.id)
    }

    // Call Backend
    try {
      if (targetColumnId !== initialCards.find(c => c.id === activeId)?.column_id) {
        // Changed Column
        await moveCard(activeId, targetColumnId, 9999)
        toast.success("Cartão movido")
      } else {
        // Same column, maybe reorder?
        // Implementing precise reorder backend persistence is Todo.
        // For now, MVP assumes moving between columns is key.
      }
    } catch (error) {
      console.error("Failed to move card", error)
      toast.error("Erro ao mover cartão")
      // Optional: Revert state
      setCards(initialCards)
    }
  }

  const handleAddCard = (colId: string) => {
    setActiveColumnId(colId)
    setIsModalOpen(true)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4 items-start">
        {columns.map(col => (
          <ColumnContainer
            key={col.id}
            column={col}
            cards={cards}
            organizationId={organizationId}
            onAddCard={handleAddCard}
            activeTimer={activeTimer}
            onTimerUpdate={setActiveTimer}
          />
        ))}

        {/* Add List Component */}
        <div className="pt-0">
          <KanbanAddList organizationId={organizationId} />
        </div>

        {/* Modal */}
        <KanbanCardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          columnId={activeColumnId}
          organizationId={organizationId}
          onCardCreated={() => {
            if (typeof window !== 'undefined') window.location.reload();
          }}
        />

        {/* Drag Overlay */}
        {mounted && createPortal(
          <DragOverlay>
            {activeDragCard ? (
              <div className="opacity-80 rotate-2 cursor-grabbing w-[300px]">
                <KanbanCard
                  card={activeDragCard}
                  onClick={() => { }}
                  isMasterView={organizationId === 'master'}
                  hideActions
                />
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </div>
    </DndContext>
  )
}

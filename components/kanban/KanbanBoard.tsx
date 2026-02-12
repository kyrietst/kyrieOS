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
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { createPortal } from 'react-dom'
import { CSS } from '@dnd-kit/utilities'

import KanbanCardModal from './KanbanCardModal'
import KanbanAddList from './KanbanAddList'
import KanbanAddCard from './KanbanAddCard'
import KanbanCard from './KanbanCard'
import { moveCard, reorderCardsInColumn, reorderColumns } from '@/actions/kanban'
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
    <div ref={setNodeRef} style={style} className="touch-none">
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

// SortableColumn: Makes a column draggable
function SortableColumn({
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isMaster = organizationId === 'master'
  const columnCards = cards.filter(c => c.column_id === column.id)
  const cardIds = columnCards.map(c => c.id)

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col w-[320px] min-w-[320px] shrink-0 h-full">
      {/* Column Header - Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between p-3 bg-muted/50 rounded-t-lg border-b cursor-grab active:cursor-grabbing"
      >
        <h3 className="font-semibold text-sm flex items-center gap-2">
          {column.name}
          <span className="text-xs text-muted-foreground font-normal">{columnCards.length}</span>
        </h3>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-2 bg-muted/20 rounded-b-lg space-y-2 min-h-[100px]">
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
  const [columns, setColumns] = useState(initialColumns)
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
    // Se for coluna, poderia setar activeColumn para overlay, mas não é essencial
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Card'
    const isActiveColumn = active.data.current?.type === 'Column'
    const isOverTask = over.data.current?.type === 'Card'
    const isOverColumn = over.data.current?.type === 'Column'

    // Handle Column drag (horizontal reorder)
    if (isActiveColumn && isOverColumn) {
      setColumns(cols => {
        const oldIndex = cols.findIndex(c => c.id === activeId)
        const newIndex = cols.findIndex(c => c.id === overId)
        return arrayMove(cols, oldIndex, newIndex)
      })
      return
    }

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
    const overId = over.id as string

    if (activeId === overId) return

    const isActiveColumn = active.data.current?.type === 'Column'
    const isOverColumn = over.data.current?.type === 'Column'

    // Handle Column drag-end (persist reorder)
    if (isActiveColumn && isOverColumn) {
      const oldIndex = columns.findIndex(c => c.id === activeId)
      const newIndex = columns.findIndex(c => c.id === overId)

      if (oldIndex !== newIndex) {
        const reorderedColumns = arrayMove(columns, oldIndex, newIndex)
        const updatedPositions = reorderedColumns.map((col, index) => ({
          id: col.id,
          position: index
        }))

        try {
          await reorderColumns(updatedPositions)
          toast.success("Coluna reordenada")
        } catch (error) {
          console.error("Failed to reorder columns", error)
          toast.error("Erro ao reordenar coluna")
          setColumns(initialColumns) // Revert
        }
      }
      return
    }

    // Handle Card drag
    const activeCard = cards.find(c => c.id === activeId)
    if (!activeCard) return

    const isOverTask = over.data.current?.type === 'Card'

    let targetColumnId = activeCard.column_id

    if (isOverTask) {
      const overCard = cards.find(c => c.id === overId)
      if (overCard) targetColumnId = overCard.column_id
    } else if (isOverColumn) {
      targetColumnId = String(overId)
    }

    const originalColumnId = initialCards.find(c => c.id === activeId)?.column_id

    // Determine if moving to different column or same column reorder
    try {
      if (targetColumnId !== originalColumnId) {
        // Changed Column - move to end
        await moveCard(activeId, targetColumnId, 9999)
        toast.success("Cartão movido para outra coluna")
      } else {
        // Same column reorder - calculate precise positions
        const columnCards = cards.filter(c => c.column_id === targetColumnId)
        const oldIndex = columnCards.findIndex(c => c.id === activeId)
        const newIndex = isOverTask
          ? columnCards.findIndex(c => c.id === overId)
          : columnCards.length - 1

        if (oldIndex !== newIndex) {
          // Recalculate positions for all cards in column
          const reorderedCards = arrayMove(columnCards, oldIndex, newIndex)
          const updatedPositions = reorderedCards.map((card, index) => ({
            id: card.id,
            position: index
          }))

          await reorderCardsInColumn(updatedPositions)
          toast.success("Cartão reordenado")
        }
      }
    } catch (error) {
      console.error("Failed to move/reorder card", error)
      toast.error("Erro ao mover cartão")
      // Revert state
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
        <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
          {columns.map(col => (
            <SortableColumn
              key={col.id}
              column={col}
              cards={cards}
              organizationId={organizationId}
              onAddCard={handleAddCard}
              activeTimer={activeTimer}
              onTimerUpdate={setActiveTimer}
            />
          ))}
        </SortableContext>

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

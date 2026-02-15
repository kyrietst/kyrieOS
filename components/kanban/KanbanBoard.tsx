'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
  TouchSensor,
  KeyboardSensor
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { createPortal } from 'react-dom'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'

import KanbanCardModal from './KanbanCardModal'
import KanbanAddList from './KanbanAddList'
import KanbanAddCard from './KanbanAddCard'
import KanbanCard from './KanbanCard'
import { moveCard, reorderCardsInColumn, reorderColumns, moveCardToMasterStatus } from '@/actions/kanban'
import { getUserActiveTimer } from '@/actions/time-tracking'
import { TimeEntry, KanbanColumn } from '@/types/kanban'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { triggerConfetti } from '@/utils/confetti'
import { Globe, Search } from 'lucide-react'
import { useKanbanBackground } from '@/hooks/use-kanban-background'
import { KanbanPageOptions } from './KanbanPageOptions'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useHeaderActions } from '@/contexts/HeaderActionsContext'
import KanbanColumnHeader from './KanbanColumnHeader'
import { updateColumnName } from '@/actions/kanban'

// --- Internal Components for Sortable ---

// --- Internal Components for Sortable ---

function SortableCard({ card, organizationId, onClick, activeTimer, onTimerUpdate, onPinToggle }: {
  card: any,
  organizationId: string,
  onClick: () => void,
  activeTimer: TimeEntry | null,
  onTimerUpdate: (t: TimeEntry | null) => void,
  onPinToggle?: (cardId: string, isPinned: boolean) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card.id || card.card_id,
    data: {
      type: 'Card',
      card,
    }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const isMaster = organizationId === 'master'

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.3 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        layout: { type: "spring", stiffness: 600, damping: 30 },
        opacity: { duration: 0.2 }
      }}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <KanbanCard
        card={card}
        onClick={onClick}
        isMasterView={isMaster}
        activeTimer={activeTimer}
        onTimerUpdate={onTimerUpdate}
        onPinToggle={onPinToggle}
      />
    </motion.div>
  )
}

// SortableColumn: Makes a column draggable
function SortableColumn({
  column,
  cards,
  organizationId,
  onAddCard,
  activeTimer,
  onTimerUpdate,
  onRename,
  onPinToggle
}: {
  column: KanbanColumn,
  cards: any[],
  organizationId: string,
  onAddCard: (colId: string) => void,
  activeTimer: TimeEntry | null,
  onTimerUpdate: (t: TimeEntry | null) => void,
  onRename: (columnId: string, newName: string) => Promise<void>,
  onPinToggle?: (cardId: string, isPinned: boolean) => void
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

  // Filter cards for this column
  const filteredCards = cards.filter(c => {
    if (isMaster) {
      let colStatus = column.status;
      if (!colStatus) {
        if (column.position === 0) colStatus = 'todo';
        else if (column.position === 1) colStatus = 'doing';
        else if (column.is_done_column || column.position === 2) colStatus = 'done';
      }
      return c.master_status === colStatus;
    }
    return c.column_id === column.id
  })

  // Sort: pinned cards first, then by updated_at
  const columnCards = [...filteredCards].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return 0
  })

  const cardIds = columnCards.map(c => c.id || c.card_id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col w-[320px] min-w-[320px] shrink-0 h-full max-h-full rounded-xl border border-border/40 overflow-hidden",
        column.organization_id === null ? "bg-background/80 backdrop-blur-sm shadow-sm" : "bg-secondary/50 shadow-sm"
      )}
    >
      {/* Column Header - Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "flex-none flex items-center justify-between p-3 cursor-grab active:cursor-grabbing relative",
          column.organization_id === null ? "bg-background/40" : "bg-secondary/10"
        )}
      >
        {/* Global Gradient Line */}
        {column.organization_id === null && (
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 to-fuchsia-500" />
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
          <KanbanColumnHeader
            column={column}
            organizationId={organizationId}
            onRename={onRename}
          />
        </div>

        <span className="text-xs text-muted-foreground font-normal ml-auto flex-shrink-0">{columnCards.length}</span>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0 glass-scrollbar">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {columnCards.map(card => (
              <SortableCard
                key={card.id || card.card_id}
                card={card}
                organizationId={organizationId}
                onClick={() => onAddCard(column.id)}
                activeTimer={activeTimer}
                onTimerUpdate={onTimerUpdate}
                onPinToggle={onPinToggle}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </div>

      {/* Footer / Add Card */}
      <div className="flex-none p-2 mt-auto">
        <KanbanAddCard
          columnId={column.id}
          organizationId={organizationId}
          isMaster={isMaster}
          columnPosition={column.position}
        />
      </div>
    </div>
  )
}


export default function KanbanBoard({
  initialColumns,
  initialCards,
  organizationId,
  extraActions
}: {
  initialColumns: any[],
  initialCards: any[],
  organizationId: string,
  extraActions?: React.ReactNode
}) {
  const router = useRouter()
  const { currentPreset } = useKanbanBackground(organizationId === 'master' ? null : organizationId)
  const [columns, setColumns] = useState(initialColumns)
  const [cards, setCards] = useState(initialCards)
  const [mounted, setMounted] = useState(false)
  const [activeDragCard, setActiveDragCard] = useState<any>(null)

  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null)

  useEffect(() => {
    setMounted(true)
    getUserActiveTimer().then(setActiveTimer)
  }, [])

  // IMPORTANT: Keep state in sync with server revalidations
  useEffect(() => {
    setColumns(initialColumns)
    setCards(initialCards)
  }, [initialColumns, initialCards])

  // Setup Realtime Listener
  useEffect(() => {
    if (!mounted || !organizationId) return

    const supabase = createClient()
    const channel = supabase
      .channel('kanban-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'kanban_cards',
          filter: organizationId !== 'master' ? `organization_id=eq.${organizationId}` : undefined
        },
        (payload: any) => {
          // Trigger a reactive server revalidation
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mounted, organizationId])

  // Inject actions into Header - Memoized to prevent infinite loop
  const headerActions = useMemo(() => (
    <div className="flex items-center gap-2">
      {extraActions}
      <KanbanPageOptions organizationId={organizationId === 'master' ? null : organizationId} />
    </div>
  ), [extraActions, organizationId])

  useHeaderActions(headerActions)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeColumnId, setActiveColumnId] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms hold to start drag on mobile
        tolerance: 5,
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
        const activeIndex = items.findIndex(t => (t.id || t.card_id) === activeId)
        const overIndex = items.findIndex(t => (t.id || t.card_id) === overId)

        if (activeIndex === -1 || overIndex === -1) return items

        // If checking same column or different, arrayMove handles index swap
        // But if different column, we need to update column_id first for the active item
        if (items[activeIndex].column_id !== items[overIndex].column_id) {
          const newItems = [...items]
          const updatedItem = { ...items[activeIndex], column_id: items[overIndex].column_id }

          // Master View Sync: update master_status based on the target card's current status
          if (organizationId === 'master') {
            updatedItem.master_status = items[overIndex].master_status
          }

          newItems[activeIndex] = updatedItem
          return arrayMove(newItems, activeIndex, overIndex)
        }
        return arrayMove(items, activeIndex, overIndex)
      })
    } else if (isOverColumn) {
      // Dropping over a Column (empty area)
      setCards(items => {
        const activeIndex = items.findIndex(t => (t.id || t.card_id) === activeId)
        if (activeIndex === -1) return items

        const activeItem = items[activeIndex]

        // Move to that column
        if (activeItem.column_id !== overId) {
          const newItems = [...items]
          const updatedItem = { ...activeItem, column_id: String(overId) }

          // Master View Sync: update master_status based on column metadata
          if (organizationId === 'master') {
            const targetColumn = columns.find(c => c.id === overId)
            if (targetColumn) {
              let colStatus = targetColumn.status;
              if (!colStatus) {
                if (targetColumn.position === 0) colStatus = 'todo';
                else if (targetColumn.position === 1) colStatus = 'doing';
                else if (targetColumn.is_done_column || targetColumn.position === 2) colStatus = 'done';
              }
              updatedItem.master_status = colStatus || 'todo';
            }
          }

          newItems[activeIndex] = updatedItem
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
    const isMaster = organizationId === 'master'
    const activeCard = cards.find(c => (c.id || c.card_id) === activeId)
    if (!activeCard) return

    const isOverTask = over.data.current?.type === 'Card'

    let targetColumnId = isMaster ? activeCard.column_id : activeCard.column_id

    if (isOverTask) {
      const overCard = cards.find(c => (c.id || c.card_id) === overId)
      if (overCard) targetColumnId = overCard.column_id
    } else if (isOverColumn) {
      targetColumnId = String(overId)
    }

    const originalColumnId = activeCard.column_id

    // Determine if moving to different column or same column reorder
    try {
      if (targetColumnId !== originalColumnId) {
        // Optimistic State Update for Master View (already handled in handleDragOver, 
        // but this ensures consistency if dragOver didn't trigger perfectly)
        if (isMaster) {
          const targetCol = columns.find(c => c.id === targetColumnId)
          let colStatus = targetCol?.status;
          if (targetCol && !colStatus) {
            if (targetCol.position === 0) colStatus = 'todo';
            else if (targetCol.position === 1) colStatus = 'doing';
            else if (targetCol.is_done_column || targetCol.position === 2) colStatus = 'done';
          }

          setCards(prev => prev.map(c =>
            (c.id || c.card_id) === activeId ? { ...c, column_id: targetColumnId, master_status: colStatus || c.master_status } : c
          ))

          // Master View: Move to a Global Status (translates to local column)
          await moveCardToMasterStatus(activeId, targetColumnId)
          toast.success("Cartão movido no Master Kanban")
        } else {
          // Client View: Standard move
          await moveCard(activeId, targetColumnId, 9999)
          toast.success("Cartão movido para outra coluna")
        }
      } else {
        // Same column reorder - calculate precise positions
        // Skip for Master view reorder for now as it's a feed (sorted by date usually)
        if (isMaster) return

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

      // CELEBRATION: If moved to a "done" column, trigger confetti + flash
      const targetCol = columns.find(c => c.id === targetColumnId)
      const isDone = targetCol?.is_done_column || targetCol?.name.toLowerCase().includes('done') || targetCol?.name.toLowerCase().includes('concluido')

      if (isDone) {
        // Trigger confetti
        triggerConfetti()

        // Trigger visual flash on the specific card
        setCards(prev => prev.map(c =>
          (c.id || c.card_id) === activeId ? { ...c, justDropped: true } : c
        ))

        // Cleanup flash after 1s
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            (c.id || c.card_id) === activeId ? { ...c, justDropped: false } : c
          ))
        }, 1100)
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

  const handlePinToggle = (cardId: string, isPinned: boolean) => {
    setCards(prev => prev.map(c =>
      (c.id || c.card_id) === cardId
        ? { ...c, is_pinned: isPinned, pinned_at: isPinned ? new Date().toISOString() : null }
        : c
    ))
  }

  const handleRenameColumn = async (columnId: string, newName: string) => {
    // 1. Optimistic Update
    setColumns(prev => prev.map(c =>
      c.id === columnId ? { ...c, name: newName } : c
    ))

    // 2. Server Action
    try {
      await updateColumnName(columnId, newName)
      toast.success('Coluna renomeada')
    } catch (error) {
      console.error('Failed to rename column:', error)
      toast.error('Erro ao renomear coluna')
      // Revert is handled by router.refresh or we could revert manualy here if we kept previous state
      setColumns(initialColumns)
    }
  }

  return (
    <div className={cn("flex flex-col h-full w-full overflow-hidden transition-all duration-500 ease-in-out", currentPreset.className)}>
      {/* Board Header - Removed, moved to Header via useHeaderActions */}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 overflow-x-auto p-4 items-start glass-scrollbar">
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
                onRename={handleRenameColumn}
                onPinToggle={handlePinToggle}
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
            <DragOverlay zIndex={1000} dropAnimation={{
              duration: 400,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
              {activeDragCard ? (
                <motion.div
                  initial={{ scale: 1, rotate: 0 }}
                  animate={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="cursor-grabbing w-[300px] pointer-events-none"
                  style={{
                    filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15)) drop-shadow(0 10px 10px rgb(0 0 0 / 0.1))'
                  }}
                >
                  <KanbanCard
                    card={activeDragCard}
                    onClick={() => { }}
                    isMasterView={organizationId === 'master'}
                    hideActions
                  />
                </motion.div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </div>
      </DndContext>
    </div>
  )
}

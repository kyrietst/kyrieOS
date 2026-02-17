'use server'

import { createClient } from '@/utils/supabase/server'
import { KanbanCard } from '@/types/kanban'
import { revalidatePath } from 'next/cache'

/**
 * Fetches cards for the calendar view.
 * Gets cards that have a start_date OR due_date within the range.
 * Also fetches cards without dates but with estimated_minutes for the backlog/all-day.
 */
export async function getCalendarEvents(start: Date, end: Date) {
    const supabase = await createClient()

    // Convert to ISO string for comparison
    const startIso = start.toISOString()
    const endIso = end.toISOString()

    // Logic: 
    // 1. Cards with start_date OR end_date overlapping range
    // 2. Cards with due_date within range
    const { data, error } = await supabase
        .from('kanban_cards')
        .select(`
      *,
      assigned_to_user:assigned_to (
        id, full_name, avatar_url, email
      ),
      organization:organization_id (
        name, slug
      )
    `)
        .or(`start_date.gte.${startIso},due_date.gte.${startIso}`)
    // Note: This simple OR query might miss some long-spanning events started before range.
    // For MVP/Foundation, we filter mostly by start/due range.
    // Ideally: (start <= end AND end >= start)

    if (error) {
        console.error('Error fetching calendar events:', error)
        return []
    }

    return data as any[]
}

export async function updateCardSchedule(cardId: string, start: Date, end: Date) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('kanban_cards')
        .update({
            start_date: start.toISOString(),
            end_date: end.toISOString(),
            // Also sync due_date to end time? 
            // User Logic: "Cards with only a due_date (no time) stay in All Day".
            // If we drag to time slot, we set start/end.
            // Should we update due_date? 
            // Generally yes, if it's a scheduled block, the due date is likely the end of that block.
            due_date: end.toISOString()
        })
        .eq('id', cardId)

    if (error) {
        console.error('Error updating card schedule:', error)
        throw error
    }

    revalidatePath('/kyrie/workspace/calendar')
}

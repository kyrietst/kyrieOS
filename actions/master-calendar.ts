'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Fetches all cards with calculated liquid capacity (burn-down) from the strategic view.
 * This view joins kanban_cards with kanban_time_entries.
 */
export async function getCapacityCalendarData() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('capacity_burn_down_view')
        .select('*')
        .order('due_date', { ascending: true })

    if (error) {
        console.error('Error fetching capacity calendar data:', error)
        return []
    }

    return data || []
}

/**
 * Updates a card's strategic planning fields.
 */
export async function updateCardStrategicFields(cardId: string, updates: {
    due_date?: string | null,
    estimated_minutes?: number,
    ice_ease?: number
}) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('kanban_cards')
        .update(updates)
        .eq('id', cardId)
        .select()
        .single()

    if (error) {
        console.error('Error updating card strategic fields:', error)
        throw error
    }

    return data
}

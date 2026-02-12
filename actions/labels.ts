'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ==================== LABELS CRUD ====================

export async function getOrganizationLabels(organizationId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('kanban_labels')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name')

    if (error) throw error
    return data
}

export async function createLabel(organizationId: string, name: string, color: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('kanban_labels')
        .insert({ organization_id: organizationId, name, color })
        .select()
        .single()

    if (error) throw error
    revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
    return data
}

export async function updateLabel(labelId: string, updates: { name?: string, color?: string }) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('kanban_labels')
        .update(updates)
        .eq('id', labelId)

    if (error) throw error
    revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

export async function deleteLabel(labelId: string) {
    const supabase = await createClient()
    // CASCADE DELETE will automatically remove kanban_card_labels entries
    const { error } = await supabase
        .from('kanban_labels')
        .delete()
        .eq('id', labelId)

    if (error) throw error
    revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

// ==================== CARD <-> LABEL ASSOCIATION ====================

export async function getCardLabels(cardId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('kanban_card_labels')
        .select(`
      label_id,
      kanban_labels (
        id,
        name,
        color
      )
    `)
        .eq('card_id', cardId)

    if (error) throw error
    return data?.map(item => item.kanban_labels).filter(Boolean) || []
}

export async function addLabelToCard(cardId: string, labelId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('kanban_card_labels')
        .insert({ card_id: cardId, label_id: labelId })

    if (error) {
        // Ignore unique constraint violations (already associated)
        if (error.code !== '23505') throw error
    }
    revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

export async function removeLabelFromCard(cardId: string, labelId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('kanban_card_labels')
        .delete()
        .eq('card_id', cardId)
        .eq('label_id', labelId)

    if (error) throw error
    revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

// ==================== BATCH OPERATIONS ====================

export async function setCardLabels(cardId: string, labelIds: string[]) {
    const supabase = await createClient()

    // 1. Remove all existing labels
    await supabase
        .from('kanban_card_labels')
        .delete()
        .eq('card_id', cardId)

    // 2. Add new labels
    if (labelIds.length > 0) {
        const { error } = await supabase
            .from('kanban_card_labels')
            .insert(labelIds.map(labelId => ({ card_id: cardId, label_id: labelId })))

        if (error) throw error
    }

    revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

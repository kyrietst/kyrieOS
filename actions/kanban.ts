'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Columns
export async function getKanbanColumns(organizationId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('kanban_columns')
    .select('*')
    .order('position')

  if (organizationId && organizationId !== 'master' && organizationId !== 'global') {
    // Visão Cliente: Apenas colunas do cliente
    query = query.eq('organization_id', organizationId)
  } else {
    // Visão Master: Apenas colunas globais (IS NULL)
    query = query.is('organization_id', null)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function createKanbanColumn(organizationId: string, name: string) {
  const supabase = await createClient()

  // Get max position
  const { data: maxPosData } = await supabase
    .from('kanban_columns')
    .select('position')
    .eq('organization_id', organizationId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPos = (maxPosData?.[0]?.position ?? -1) + 1

  const { data, error } = await supabase
    .from('kanban_columns')
    .insert({ organization_id: organizationId, name, position: nextPos })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/kyrie') // Revalidate everything under kyrie to be safe, or targeted.
  // Targeted paths:
  revalidatePath('/kyrie/workspace/kanban')
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  return data
}

// Alias for UX consistency (and Global Create Logic)
export async function createColumn(organizationId: string, name: string, position?: number) {
  // Legacy logic for "master" global creation removed as we now have true Global Columns.
  // If we ever need to create a column specifically for "master" context (which shouldn't happen for columns, only cards),
  // we would handle it here. For now, it's just a pass-through.

  // Note: Creating a TRUE global column (org_id=NULL) requires admin rights and should probably be a separate admin function,
  // or we handle `organizationId === 'global'` specifically.
  // But for standard client creation:
  return createKanbanColumn(organizationId, name)
}

// Cards
export async function getKanbanCards(organizationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kanban_cards')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_archived', false)
    .order('position')

  if (error) throw error
  return data
}

export async function createKanbanCard(cardData: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kanban_cards')
    .insert(cardData)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  return data
}

export async function moveCard(cardId: string, columnId: string, position: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_cards')
    .update({ column_id: columnId, position })
    .eq('id', cardId)

  if (error) throw error
  revalidatePath('/kyrie/workspace/kanban')
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

export async function reorderCardsInColumn(cards: { id: string, position: number }[]) {
  const supabase = await createClient()

  // Batch update positions
  const updates = cards.map(card =>
    supabase
      .from('kanban_cards')
      .update({ position: card.position })
      .eq('id', card.id)
  )

  await Promise.all(updates)
  revalidatePath('/kyrie/workspace/kanban')
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

export async function toggleCardCompletion(cardId: string, currentColumnId: string, organizationId: string) {
  const supabase = await createClient()

  // 1. Get all columns for this org to identify "Todo" and "Done"
  const { data: cols } = await supabase
    .from('kanban_columns')
    .select('*')
    .eq('organization_id', organizationId)
    .order('position')

  if (!cols) throw new Error('Columns not found')

  // Naively assume first is Todo, last is Done if not flagged. 
  // Ideally we check for a flag 'is_done_column'.
  // Let's assume the user wants to toggle between the *current* column and the *Done* column (or *Todo* if already Done).

  const doneCol = cols.find(c => c.is_done_column) || cols[cols.length - 1]
  const todoCol = cols[0]

  if (!doneCol || !todoCol) throw new Error('Cannot determine Done/Todo columns')

  const isCurrentlyDone = currentColumnId === doneCol.id
  const targetColId = isCurrentlyDone ? todoCol.id : doneCol.id

  // 2. Move the card
  // We append to the end of the target column (position = 9999 or count + 1)
  await moveCard(cardId, targetColId, 9999)
}

// Helper for Master Kanban Dropdown
export async function getOrganizationsSimple() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('status', 'active')
    .order('name')

  if (error) throw error
  return data
}

// Smart Create for Master View
export async function createCardFromMaster(
  targetOrganizationId: string,
  title: string,
  targetPosition: number
) {
  const supabase = await createClient()

  // 1. Find the real column ID in the target org at the target position
  // We try to match position exactly. 
  // If not found (e.g. standard todo/doing/done mapping might be fuzzy), we fallback to logic.

  let { data: column } = await supabase
    .from('kanban_columns')
    .select('id')
    .eq('organization_id', targetOrganizationId)
    .eq('position', targetPosition)
    .single()

  // Fallback: If exact position not found, try to find "Todo" if position was 0, or just the first column
  if (!column) {
    const { data: firstCol } = await supabase
      .from('kanban_columns')
      .select('id')
      .eq('organization_id', targetOrganizationId)
      .order('position')
      .limit(1)
      .single()

    if (!firstCol) throw new Error('Target organization has no columns')
    column = firstCol
  }

  // 2. Create the card
  return createKanbanCard({
    organization_id: targetOrganizationId,
    column_id: column.id,
    title,
    position: 99999 // Append to end
  })
}

/**
 * Handles moving a card in the Master View.
 * Translates a Global Column ID to the corresponding Local Column ID for the card's organization.
 */
export async function moveCardToMasterStatus(cardId: string, targetGlobalColumnId: string) {
  const supabase = await createClient()

  // 1. Get card details to find its organization
  const { data: card, error: cardError } = await supabase
    .from('kanban_cards')
    .select('organization_id')
    .eq('id', cardId)
    .single()

  if (cardError || !card) throw new Error('Card not found or access denied')

  // 2. Get global column details to find its name
  const { data: globalCol, error: globalError } = await supabase
    .from('kanban_columns')
    .select('name')
    .eq('id', targetGlobalColumnId)
    .is('organization_id', null)
    .single()

  if (globalError || !globalCol) throw new Error('Target master column not found')

  // 3. Find matching local column for that organization
  const { data: localCol, error: localError } = await supabase
    .from('kanban_columns')
    .select('id')
    .eq('organization_id', card.organization_id)
    .eq('name', globalCol.name)
    .single()

  if (localError || !localCol) {
    console.error(`Could not find matching local column for ${globalCol.name} in org ${card.organization_id}`)
    throw new Error('Coluna correspondente não encontrada no cliente')
  }

  // 4. Update the card
  const { error: updateError } = await supabase
    .from('kanban_cards')
    .update({ column_id: localCol.id, position: 9999 })
    .eq('id', cardId)

  if (updateError) throw updateError

  revalidatePath('/kyrie/workspace/kanban')
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

// Quick Actions
export async function duplicateCard(cardId: string, targetColumnId: string) {
  const supabase = await createClient()

  // 1. Fetch original card
  const { data: originalCard, error: fetchError } = await supabase
    .from('kanban_cards')
    .select('*')
    .eq('id', cardId)
    .single()

  if (fetchError) {
    console.error('Error fetching card to duplicate:', fetchError)
    throw fetchError
  }
  if (!originalCard) throw new Error('Card not found')

  // 2. Get max position in target column
  const { data: maxPosData } = await supabase
    .from('kanban_cards')
    .select('position')
    .eq('column_id', targetColumnId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPos = (maxPosData?.[0]?.position ?? -1) + 1

  // 3. Create copy
  // Remove system fields to generate new ones
  const {
    id,
    created_at,
    updated_at,
    completed_at,
    trello_card_id,
    ice_score, // Generated column, must be excluded
    ...cardData
  } = originalCard

  const { data: newCard, error: createError } = await supabase
    .from('kanban_cards')
    .insert({
      ...cardData,
      column_id: targetColumnId,
      title: `${originalCard.title} (Copy)`,
      position: nextPos,
      is_archived: false
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating duplicate card:', createError)
    throw createError
  }

  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  return newCard
}

export async function archiveCard(cardId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_cards')
    .update({ is_archived: true })
    .eq('id', cardId)

  if (error) {
    console.error('Error archiving card:', error)
    throw error
  }
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

export async function updateCardColor(cardId: string, color: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_cards')
    .update({ cover_color: color })
    .eq('id', cardId)

  if (error) {
    console.error('Error updating card color:', error)
    throw error
  }
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

export async function assignCard(cardId: string, userId: string | null) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_cards')
    .update({ assigned_to: userId })
    .eq('id', cardId)

  if (error) {
    console.error('Error assigning card:', error)
    throw error
  }
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

export async function updateCardDetails(cardId: string, updates: {
  title?: string,
  description?: string,
  impact?: number,
  confidence?: number,
  effort?: number
}) {
  const supabase = await createClient()

  if (!updates.title && !updates.description && !updates.impact && !updates.confidence && !updates.effort) return

  const { error } = await supabase
    .from('kanban_cards')
    .update(updates)
    .eq('id', cardId)

  if (error) {
    console.error('Error updating card details:', error)
    throw error
  }

  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

// ==================== COLUMN MANAGEMENT ====================

export async function updateColumnName(columnId: string, newName: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_columns')
    .update({ name: newName })
    .eq('id', columnId)

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

export async function deleteColumn(columnId: string, moveCardsToColumnId?: string) {
  const supabase = await createClient()

  if (moveCardsToColumnId) {
    // Move all cards to another column before deleting
    const { error: moveError } = await supabase
      .from('kanban_cards')
      .update({ column_id: moveCardsToColumnId })
      .eq('column_id', columnId)

    if (moveError) throw moveError
  } else {
    // Archive all cards in this column
    const { error: archiveError } = await supabase
      .from('kanban_cards')
      .update({ is_archived: true })
      .eq('column_id', columnId)

    if (archiveError) throw archiveError
  }

  // Delete the column
  const { error } = await supabase
    .from('kanban_columns')
    .delete()
    .eq('id', columnId)

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

export async function updateColumnWipLimit(columnId: string, limit: number | null) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_columns')
    .update({ wip_limit: limit })
    .eq('id', columnId)

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

export async function reorderColumns(columns: { id: string, position: number }[]) {
  const supabase = await createClient()

  const updates = columns.map(col =>
    supabase
      .from('kanban_columns')
      .update({ position: col.position })
      .eq('id', col.id)
  )

  await Promise.all(updates)
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

export async function updateCardCover(
  cardId: string,
  coverType: 'color' | 'image' | null,
  coverValue: string | null,
  coverMode: 'header' | 'full' = 'header',
  coverTextTheme: 'light' | 'dark' = 'dark',
  coverSize: 'small' | 'large' = 'small'
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('kanban_cards')
    .update({
      cover_type: coverType,
      cover_value: coverValue,
      cover_mode: coverMode,
      cover_size: coverSize,
      cover_text_theme: coverTextTheme,
      updated_at: new Date().toISOString()
    })
    .eq('id', cardId)

  if (error) {
    console.error('Error updating card cover:', error)
    throw error
  }

  revalidatePath('/kyrie/workspace/kanban')
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  return { success: true }
}

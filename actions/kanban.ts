'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Columns
export async function getKanbanColumns(organizationId?: string) {
  const supabase = await createClient()

  // UNIFIED KANBAN: Always fetch Global Columns (organization_id IS NULL)
  // We ignore the organizationId parameter for filtering columns, 
  // because all organizations now share the same Single Global Board structure.

  const { data, error } = await supabase
    .from('kanban_columns')
    .select('*')
    .is('organization_id', null)
    .order('position')

  if (error) throw error
  return data || []
}

export async function createKanbanColumn(organizationId: string, name: string) {
  const supabase = await createClient()

  // UNIFIED KANBAN: Create Global Column ONLY
  // Even if called from a specific org context, we create a Global Column.
  // Realistically, this should be restricted to Admins via RLS.

  // Get max position for Global Columns
  const { data: maxPosData } = await supabase
    .from('kanban_columns')
    .select('position')
    .is('organization_id', null)
    .order('position', { ascending: false })
    .limit(1)

  const nextPos = (maxPosData?.[0]?.position ?? -1) + 1

  const { data, error } = await supabase
    .from('kanban_columns')
    .insert({
      organization_id: null, // Force Global
      name,
      position: nextPos
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/kyrie')
  revalidatePath('/kyrie/workspace/kanban')
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  return data
}

// Alias for UX consistency
export async function createColumn(organizationId: string, name: string, position?: number) {
  return createKanbanColumn(organizationId, name)
}

// Cards
export async function getKanbanCards(organizationId: string | null = null) {
  const supabase = await createClient()
  let query = supabase
    .from('kanban_cards')
    .select(`
      *,
      kanban_card_labels (
        kanban_labels (
          name,
          color
        )
      ),
      organizations (
        name,
        slug,
        logo_url
      )
    `)
    .eq('is_archived', false)
    .order('position')

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  const { data, error } = await query

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

  // 1. Get Global Columns (Unified)
  const { data: cols } = await supabase
    .from('kanban_columns')
    .select('*')
    .is('organization_id', null)
    .order('position')

  if (!cols) throw new Error('Columns not found')

  // Naively assume first is Todo, last is Done if not flagged. 
  const doneCol = cols.find(c => c.is_done_column) || cols[cols.length - 1]
  const todoCol = cols[0]

  if (!doneCol || !todoCol) throw new Error('Cannot determine Done/Todo columns')

  const isCurrentlyDone = currentColumnId === doneCol.id
  const targetColId = isCurrentlyDone ? todoCol.id : doneCol.id

  // 2. Move the card
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

  // UNIFIED KANBAN: 
  // We need to find the GLOBAL column that corresponds to the `targetPosition` (0, 1, 2...).
  // Master View columns are Global Columns.

  let { data: column } = await supabase
    .from('kanban_columns')
    .select('id')
    .is('organization_id', null) // Global ONLY
    .eq('position', targetPosition)
    .single()

  // Fallback
  if (!column) {
    const { data: firstCol } = await supabase
      .from('kanban_columns')
      .select('id')
      .is('organization_id', null)
      .order('position')
      .limit(1)
      .single()

    if (!firstCol) throw new Error('System has no global columns')
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
 * UNIFIED KANBAN: Direct move. No mapping needed.
 */
export async function moveCardToMasterStatus(cardId: string, targetGlobalColumnId: string) {
  const supabase = await createClient()

  // 1. Verify card exists (basic access control)
  // We don't strictly need to check organization match anymore because 
  // the column IS global. We just need to ensure the user can update this card.

  const { data: card, error: cardError } = await supabase
    .from('kanban_cards')
    .select('id, organization_id')
    .eq('id', cardId)
    .single()

  if (cardError || !card) throw new Error('Card not found or access denied')

  // 2. Update the card
  const { error: updateError } = await supabase
    .from('kanban_cards')
    .update({ column_id: targetGlobalColumnId, position: 9999 })
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
  revalidatePath('/kyrie/workspace/kanban')
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
export async function toggleCardPin(cardId: string, isPinned: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_cards')
    .update({
      is_pinned: isPinned,
      pinned_at: isPinned ? new Date().toISOString() : null
    })
    .eq('id', cardId)

  if (error) {
    console.error('Error toggling pin:', error)
    throw error
  }

  revalidatePath('/kyrie/workspace/kanban')
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

// ==================== CHECKLIST ACTIONS ====================

export async function addChecklist(cardId: string, organizationId: string, title: string = 'Checklist') {
  const supabase = await createClient()

  // Get max position
  const { data: existing } = await supabase
    .from('kanban_checklists')
    .select('position')
    .eq('card_id', cardId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPos = (existing?.[0]?.position ?? -1) + 1

  const { data, error } = await supabase
    .from('kanban_checklists')
    .insert({ card_id: cardId, organization_id: organizationId, title, position: nextPos })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  revalidatePath('/kyrie/workspace/kanban')
  return data
}

export async function deleteChecklist(checklistId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_checklists')
    .delete()
    .eq('id', checklistId)

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  revalidatePath('/kyrie/workspace/kanban')
}

export async function addChecklistItem(checklistId: string, organizationId: string, content: string) {
  const supabase = await createClient()

  // Get max position
  const { data: existing } = await supabase
    .from('kanban_checklist_items')
    .select('position')
    .eq('checklist_id', checklistId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPos = (existing?.[0]?.position ?? -1) + 1

  const { data, error } = await supabase
    .from('kanban_checklist_items')
    .insert({
      checklist_id: checklistId,
      organization_id: organizationId,
      content,
      position: nextPos
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  revalidatePath('/kyrie/workspace/kanban')
  return data
}

export async function toggleChecklistItem(itemId: string, isCompleted: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_checklist_items')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null
    })
    .eq('id', itemId)

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  revalidatePath('/kyrie/workspace/kanban')
}

export async function deleteChecklistItem(itemId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_checklist_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  revalidatePath('/kyrie/workspace/kanban')
}

export async function getCardChecklists(cardId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kanban_checklists')
    .select(`
      *,
      items:kanban_checklist_items(*)
    `)
    .eq('card_id', cardId)
    .order('position')

  if (error) throw error

  // Sort items by position within each checklist
  return (data || []).map((cl: any) => ({
    ...cl,
    items: (cl.items || []).sort((a: any, b: any) => a.position - b.position)
  }))
}

// ==================== COMMENT ACTIONS ====================

export async function addCardComment(cardId: string, organizationId: string, content: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // 1. Insert into dedicated comments table
  const { data: comment, error } = await supabase
    .from('kanban_card_comments')
    .insert({
      card_id: cardId,
      organization_id: organizationId,
      user_id: user.id,
      content
    })
    .select(`
      *,
      profiles:user_id(full_name, avatar_url)
    `)
    .single()

  if (error) throw error

  // 2. Also log to activities feed (fire-and-forget, don't block on failure)
  try {
    await supabase.rpc('log_activity', {
      p_user_id: user.id,
      p_user_name: (comment as any).profiles?.full_name || user.email || 'Unknown',
      p_org_id: organizationId,
      p_type: 'comment_added',
      p_title: 'Comentou no cartão',
      p_description: content.substring(0, 200),
      p_target_type: 'kanban_card',
      p_target_id: cardId,
      p_metadata: { comment_id: comment.id }
    })
  } catch (e) {
    console.error('Failed to log comment activity:', e)
  }

  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  revalidatePath('/kyrie/workspace/kanban')
  return comment
}

export async function getCardComments(cardId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kanban_card_comments')
    .select(`
      *,
      profiles:user_id(full_name, avatar_url)
    `)
    .eq('card_id', cardId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function deleteCardComment(commentId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_card_comments')
    .delete()
    .eq('id', commentId)

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  revalidatePath('/kyrie/workspace/kanban')
}

// ==================== ATTACHMENT ACTIONS ====================

export async function uploadCardAttachment(formData: FormData) {
  const supabase = await createClient()

  const file = formData.get('file') as File
  const cardId = formData.get('cardId') as string
  const organizationId = formData.get('organizationId') as string

  if (!file || !cardId || !organizationId) throw new Error('Missing required fields')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Upload to Storage
  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/${cardId}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('kanban-attachments')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('kanban-attachments')
    .getPublicUrl(filePath)

  // Insert metadata
  const { data, error } = await supabase
    .from('kanban_attachments')
    .insert({
      card_id: cardId,
      organization_id: organizationId,
      user_id: user.id,
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  revalidatePath('/kyrie/workspace/kanban')
  return data
}

export async function getCardAttachments(cardId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kanban_attachments')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function deleteCardAttachment(attachmentId: string, fileUrl: string) {
  const supabase = await createClient()

  // Extract path from URL for storage deletion
  const urlParts = fileUrl.split('/kanban-attachments/')
  if (urlParts[1]) {
    await supabase.storage
      .from('kanban-attachments')
      .remove([urlParts[1]])
  }

  const { error } = await supabase
    .from('kanban_attachments')
    .delete()
    .eq('id', attachmentId)

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  revalidatePath('/kyrie/workspace/kanban')
}

// ==================== DUE DATE ACTIONS ====================

export async function updateCardDueDate(cardId: string, dueDate: string | null) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_cards')
    .update({ due_date: dueDate })
    .eq('id', cardId)

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  revalidatePath('/kyrie/workspace/kanban')
}

// ==================== MEMBER ACTIONS ====================

export async function getCardMembers(cardId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kanban_card_members')
    .select(`
      user_id,
      profiles:user_id (
        id,
        full_name,
        avatar_url,
        email
      )
    `)
    .eq('card_id', cardId)

  if (error) {
    console.error('Error in getCardMembers:', error)
    return []
  }
  return data.map((item: any) => item.profiles)
}

export async function addCardMember(cardId: string, userId: string, organizationId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_card_members')
    .insert({ card_id: cardId, user_id: userId })

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  revalidatePath('/kyrie/workspace/kanban')
}

export async function removeCardMember(cardId: string, userId: string, organizationId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('kanban_card_members')
    .delete()
    .eq('card_id', cardId)
    .eq('user_id', userId)

  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  revalidatePath('/kyrie/workspace/kanban')
}

export async function getWorkspaceMembers(organizationId: string) {
  const supabase = await createClient()

  // Fetch profiles belonging to the organization OR are KYRIE_ADMIN
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, email, role')
    .or(`organization_id.eq.${organizationId},role.eq.KYRIE_ADMIN`)
    .order('full_name')

  if (error) {
    console.error('Error fetching workspace members:', error)
    return []
  }

  return data
}

export async function updateCardDates(
  cardId: string,
  dates: { startDate?: string | null, dueDate?: string | null, reminder?: string | null }
) {
  const supabase = await createClient()

  const updates: any = {}
  if (dates.startDate !== undefined) updates.start_date = dates.startDate
  if (dates.dueDate !== undefined) updates.due_date = dates.dueDate
  if (dates.reminder !== undefined) updates.reminder_at = dates.reminder

  const { error } = await supabase
    .from('kanban_cards')
    .update(updates)
    .eq('id', cardId)

  if (error) {
    console.error('Error in updateCardDates:', error)
    throw new Error('Failed to update card dates')
  }

  revalidatePath('/dashboard/kanban')
  return { success: true }
}

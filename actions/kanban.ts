'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Columns
export async function getKanbanColumns(organizationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kanban_columns')
    .select('*')
    .eq('organization_id', organizationId)
    .order('position')
  
  if (error) throw error
  return data
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
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
  return data
}

// Cards
export async function getKanbanCards(organizationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kanban_cards')
    .select('*')
    .eq('organization_id', organizationId)
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
  revalidatePath('/kyrie/clients/[slug]/kanban', 'page')
}

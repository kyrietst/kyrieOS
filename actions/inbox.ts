'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getInboxItems() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('inbox_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function markAsRead(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('inbox_items')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) throw error
  revalidatePath('/kyrie/inbox')
}

export async function archiveItem(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('inbox_items')
    .update({ is_archived: true })
    .eq('id', id)
    
  if (error) throw error
  revalidatePath('/kyrie/inbox')
}

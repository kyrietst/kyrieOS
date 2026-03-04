'use server'

import { createClient } from '@/utils/supabase/server'

export async function getClients() {
  const supabase = await createClient()

  // Each organization represents a client company under Kyrie's management
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url')
    .order('name')

  if (error) throw error
  return data
}

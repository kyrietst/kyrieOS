'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getWikiPages(organizationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wiki_pages')
    .select('*')
    .eq('organization_id', organizationId)
    .order('title')
    
  if (error) throw error
  return data
}

export async function getWikiPage(slug: string, organizationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wiki_pages')
    .select('*')
    .eq('slug', slug)
    .eq('organization_id', organizationId)
    .single()
    
  if (error) throw error
  return data
}

export async function createWikiPage(organizationId: string, pageData: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wiki_pages')
    .insert({ ...pageData, organization_id: organizationId })
    .select()
    .single()
    
  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/wiki', 'page')
  return data
}

export async function updateWikiPage(id: string, pageData: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wiki_pages')
    .update(pageData)
    .eq('id', id)
    .select()
    .single()
    
  if (error) throw error
  revalidatePath('/kyrie/clients/[slug]/wiki', 'page')
  return data
}

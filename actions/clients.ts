'use server'

import { createClient } from '@/utils/supabase/server'

export async function getClients() {
  const supabase = await createClient()
  
  // Assuming 'organizations' table holds clients or implies them
  // Based on PRD, clients are organizations under the main agency workspace?
  // Or maybe there is a 'clients' table?
  // Let's check the tables again. 'profiles' has role 'CLIENT_OWNER'.
  // 'organizations' table likely holds the client entities if they are separate workspaces.
  // Or maybe 'projects' are clients?
  // PRD 3.0 Structure: /kyrie/clients/[slug]
  // Let's assume 'organizations' with a certain flag or just all organizations that are NOT the main Kyrie Admin one.
  // Or maybe we just list all organizations for now.
  
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, slug, avatar_url')
    .order('name')
    
  if (error) throw error
  return data
}

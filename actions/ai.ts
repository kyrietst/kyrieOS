'use server'

import { createClient } from '@/utils/supabase/server'

export async function sendMessage(conversationId: string | undefined, message: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let convId = conversationId

  // Create conversation if not exists
  if (!convId) {
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ user_id: user.id, title: message.substring(0, 30) + '...' })
      .select()
      .single()
    if (error) throw error
    convId = data.id
  }

  // Save user message
  await supabase.from('ai_messages').insert({
    conversation_id: convId,
    role: 'user',
    content: message
  })

  // Mock AI response for now (Integration would go here)
  const aiResponse = `This is a mock response to: "${message}". RAG integration coming soon.`
  
  // Save assistant message
  await supabase.from('ai_messages').insert({
    conversation_id: convId,
    role: 'assistant',
    content: aiResponse
  })

  return { conversationId: convId, message: aiResponse }
}

export async function getConversations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    
  if (error) throw error
  return data
}

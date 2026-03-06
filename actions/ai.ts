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
  const { error: userMsgError } = await supabase.from('ai_messages').insert({
    conversation_id: convId,
    role: 'user',
    content: message
  })
  if (userMsgError) throw userMsgError

  // Buscar histórico para contexto (últimas 20 mensagens)
  const { data: history } = await supabase
    .from('ai_messages')
    .select('role, content')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true })
    .limit(20)

  const conversationHistory = (history || []).map((m: { role: string; content: string }) => ({
    role: m.role,
    content: m.content,
  }))

  // Chamar backend Python (LangGraph + Gemini/Groq)
  const backendUrl = process.env.API_URL || 'http://localhost:8002'

  const backendResponse = await fetch(`${backendUrl}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
    }),
  })

  if (!backendResponse.ok) {
    throw new Error(`Backend error: ${backendResponse.status}`)
  }

  const backendData = await backendResponse.json()
  const aiResponse: string = backendData.message
  const modelUsed: string | null = backendData.model_used || null
  const tokensUsed: number | null = backendData.tokens_used || null

  // Save assistant message
  const { error: assistantMsgError } = await supabase.from('ai_messages').insert({
    conversation_id: convId,
    role: 'assistant',
    content: aiResponse,
    model_used: modelUsed,
    tokens_used: tokensUsed,
  })
  if (assistantMsgError) throw assistantMsgError

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

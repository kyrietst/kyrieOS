'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Inicia um novo timer para um card específico.
 * Se o usuário já tiver um timer rodando em OUTRO card, ele será parado automaticamente.
 */
export async function startTimer(cardId: string) {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    // 2. Stop any running timer for this user
    await stopTimer()

    // 3. Start new timer
    const { data, error } = await supabase
        .from('kanban_time_entries')
        .insert({
            card_id: cardId,
            user_id: user.id,
            start_time: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        console.error('Error starting timer:', error)
        throw error
    }

    revalidatePath('/kyrie/workspace/kanban')
    revalidatePath('/kyrie/clients/[slug]/kanban', 'page')

    return data
}

/**
 * Para o timer ativo do usuário atual (se houver).
 */
export async function stopTimer() {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    // 2. Find active timer
    // We explicitly search for end_time IS NULL
    const { data: activeEntry } = await supabase
        .from('kanban_time_entries')
        .select('*')
        .eq('user_id', user.id)
        .is('end_time', null)
        .single()

    if (!activeEntry) {
        return null // No active timer to stop
    }

    // 3. Calculate duration
    const endTime = new Date()
    const startTime = new Date(activeEntry.start_time)
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

    // 4. Update entry
    const { data, error } = await supabase
        .from('kanban_time_entries')
        .update({
            end_time: endTime.toISOString(),
            duration: durationSeconds
        })
        .eq('id', activeEntry.id)
        .select()
        .single()

    if (error) {
        console.error('Error stopping timer:', error)
        throw error
    }

    revalidatePath('/kyrie/workspace/kanban')
    revalidatePath('/kyrie/clients/[slug]/kanban', 'page')

    return data
}

/**
 * Busca o histórico de tempo de um card.
 */
export async function getCardTimeLogs(cardId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('kanban_time_entries')
        .select(`
      *,
      profiles:user_id (
        full_name,
        avatar_url
      )
    `)
        .eq('card_id', cardId)
        .order('start_time', { ascending: false })

    if (error) {
        console.error('Error fetching time logs:', error)
        throw error
    }

    return data
}

/**
 * Busca o timer ativo do usuário (se houver).
 * Útil para saber se o botão deve mostrar "Stop" ou "Play".
 */
export async function getUserActiveTimer() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('kanban_time_entries')
        .select('*')
        .eq('user_id', user.id)
        .is('end_time', null)
        .single()

    return data
}

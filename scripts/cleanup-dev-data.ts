import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function cleanup(table: string, filter?: { column: string; value: string }) {
  let query = supabase.from(table).delete()
  if (filter) {
    query = query.eq(filter.column, filter.value)
  } else {
    query = query.neq('id', '00000000-0000-0000-0000-000000000000') // delete all
  }
  const { error } = await query
  if (error) { console.error(`❌ Falha ao limpar ${table}:`, error); return }
  console.log(`✅ ${table} limpa`)
}

async function main() {
  console.log('🧹 Iniciando cleanup do banco de dados...\n')

  // Delete in reverse FK order (children first)
  await cleanup('inbox_items')
  await cleanup('notifications')
  await cleanup('activities')
  await cleanup('ai_messages')
  await cleanup('ai_conversations')
  await cleanup('wiki_pages') // children first (parent_id)
  await cleanup('approval_history')
  await cleanup('approvals')
  await cleanup('reports')
  await cleanup('client_health')
  await cleanup('business_metrics')
  await cleanup('time_entries')
  await cleanup('tasks')
  await cleanup('kanban_time_entries')
  await cleanup('kanban_checklist_items')
  await cleanup('kanban_checklists')
  await cleanup('kanban_card_comments')
  await cleanup('kanban_card_members')
  await cleanup('kanban_card_labels')
  await cleanup('kanban_cards')
  await cleanup('kanban_labels')
  await cleanup('kanban_columns')
  await cleanup('projects')
  await cleanup('organizations')

  // Delete auth users
  console.log('\n🔑 Deletando auth users...')
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) { console.error('❌ Falha ao listar users:', listError); process.exit(1) }

  for (const user of users) {
    // Update profile first to remove org reference
    await supabase.from('profiles').update({ organization_id: null, role: 'CLIENT_VIEWER' }).eq('id', user.id)
    const { error } = await supabase.auth.admin.deleteUser(user.id)
    if (error) { console.error(`❌ Falha ao deletar user ${user.email}:`, error) }
    else { console.log(`✅ Auth user deletado: ${user.email}`) }
  }

  console.log('\n🎉 CLEANUP COMPLETO! Banco limpo.')
}

main().catch(err => { console.error('💥 Erro fatal:', err); process.exit(1) })

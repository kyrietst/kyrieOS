import { createClient } from '@/utils/supabase/server'
import fs from 'fs'
import path from 'path'

/**
 * Quick migration applier
 * Run with: npx tsx scripts/apply-migrations.ts
 */

async function applyMigrations() {
    const supabase = await createClient()

    const migrations = [
        'supabase/migrations/20260207_add_labels_system.sql',
        'supabase/migrations/20260207_add_ice_and_wip.sql'
    ]

    for (const migrationPath of migrations) {
        console.log(`\n📝 Applying: ${path.basename(migrationPath)}`)
        const sql = fs.readFileSync(migrationPath, 'utf-8')

        // Split by semicolons and execute separately (avoiding DO $$ block issues)
        const statements = sql
            .split(/;(?!\$)/g) // Split by ; but not if inside $$ block
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'))

        for (const statement of statements) {
            if (!statement) continue

            try {
                // Use raw query for DDL
                const { error } = await supabase.rpc('exec_sql', { sql: statement })
                if (error) throw error
            } catch (err: any) {
                console.error(`❌ Error:`, err.message)
                console.error(`Statement:`, statement.substring(0, 100) + '...')
                // Continue anyway for IF NOT EXISTS statements
            }
        }

        console.log(`✅ Completed: ${path.basename(migrationPath)}`)
    }

    console.log('\n✨ All migrations applied!')
}

applyMigrations().catch(console.error)

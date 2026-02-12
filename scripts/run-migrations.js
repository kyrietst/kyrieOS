/**
 * Migration Runner Script
 * Executes SQL migrations directly against Supabase database
 * Run with: node scripts/run-migrations.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function runMigration(migrationFile) {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)

    console.log(`📝 Reading migration: ${migrationFile}`)
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    console.log(`⚡ Executing migration...`)
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
        console.error(`❌ Error executing ${migrationFile}:`, error)
        throw error
    }

    console.log(`✅ Migration ${migrationFile} completed successfully`)
    return data
}

async function main() {
    console.log('🚀 Starting migration runner...\n')

    const migrations = [
        '20260207_add_labels_system.sql',
        '20260207_add_ice_and_wip.sql'
    ]

    for (const migration of migrations) {
        try {
            await runMigration(migration)
        } catch (error) {
            console.error(`\n❌ Migration failed: ${migration}`)
            console.error('Stopping migration process.')
            process.exit(1)
        }
    }

    console.log('\n✨ All migrations completed successfully!')
}

main()


import { createClient } from '@supabase/supabase-js';
import { env } from 'process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- ENV LOADING ---
function loadEnv(filePath: string) {
    if (fs.existsSync(filePath)) {
        console.log(`Loading env from ${filePath}`);
        const content = fs.readFileSync(filePath, 'utf-8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
                process.env[key] = value;
            }
        });
    } else {
        console.warn(`Env file not found: ${filePath}`);
    }
}

// Polyfill __dirname for ESM if needed, or just specific paths (assuming TS execution via tsx/ts-node)
const __filename_curr = fileURLToPath(import.meta.url);
const __dirname_curr = path.dirname(__filename_curr);
const rootDir = path.resolve(__dirname_curr, '..');

loadEnv(path.join(rootDir, '.env.local'));
loadEnv(path.join(rootDir, '.env'));

const TRELLO_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!TRELLO_KEY || !TRELLO_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing credentials. Please check .env.local or environment variables.');
    console.error(`TRELLO_KEY: ${!!TRELLO_KEY}, TRELLO_TOKEN: ${!!TRELLO_TOKEN}, SUPABASE_URL: ${!!SUPABASE_URL}, SUPABASE_KEY: ${!!SUPABASE_KEY}`);
    process.exit(1);
}

// --- CONFIGURATION ---
const BOARD_ID = '693cc50395fa67cece01e3d0'; // KYRIE - Operações
const TARGET_LABEL = "Adega Anita's";
const ORG_ID = '11111111-1111-1111-1111-111111111111';

// Trello List ID -> Kyrie Column ID
const COLUMN_MAPPING: Record<string, string> = {
    // BACKLOG -> A Fazer
    '693cc532f88cb65a10f28030': '07a5bd27-c88b-4ec3-95b0-9bf03e7cef52',
    // IDEIAS -> A Fazer
    '693cc8d16c8f9cfd043f5092': '07a5bd27-c88b-4ec3-95b0-9bf03e7cef52',

    // SPRINT ATUAL -> Em Progresso
    '693cc548ae2c30c7b1dd7ae6': '33922031-9629-44b4-b1a4-ea41fa133fc0',
    // EM EXECUÇÃO -> Em Progresso
    '693cc58de91d41f6de48bfd4': '33922031-9629-44b4-b1a4-ea41fa133fc0',
    // AGUARDANDO -> Em Progresso (decision)
    '693cc5983011e26fb26336b4': '33922031-9629-44b4-b1a4-ea41fa133fc0',

    // CONCLUÍDO -> Concluído
    '693cc5af93da9119a2397890': '2c849c96-fc9c-4e60-b036-3a879da3940f'
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface TrelloCard {
    id: string;
    name: string;
    desc: string;
    idList: string;
    labels: Array<{ name: string; color: string }>;
    pos: number;
    due?: string;
}

// --- MAIN FUNCTION ---
async function importCards() {
    console.log('--- Starting Trello Import for Adega Anita\'s ---');

    try {
        // 1. Fetch Cards
        console.log(`Fetching cards from board ${BOARD_ID}...`);
        const response = await fetch(`https://api.trello.com/1/boards/${BOARD_ID}/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}&customFieldItems=true`);

        if (!response.ok) throw new Error(`Trello API Error: ${response.statusText}`);

        const cards = await response.json() as TrelloCard[];
        console.log(`Total cards on board: ${cards.length}`);

        // 2. Filter by Label
        const adegaCards = cards.filter(c => c.labels.some(l => l.name === TARGET_LABEL));
        console.log(`Found ${adegaCards.length} cards for "${TARGET_LABEL}"`);

        // 3. Process Cards
        let importedCount = 0;
        let skippedCount = 0;

        for (const card of adegaCards) {
            const targetColumnId = COLUMN_MAPPING[card.idList];

            if (!targetColumnId) {
                console.warn(`Skipping card "${card.name}" - List ID ${card.idList} not mapped.`);
                skippedCount++;
                continue;
            }

            // Check if exists
            const { data: existing } = await supabase
                .from('kanban_cards')
                .select('id')
                .eq('trello_card_id', card.id)
                .single();

            if (existing) {
                console.log(`Card "${card.name}" already exists. Updating...`);
                // Optional: Update logic
            } else {
                console.log(`Importing "${card.name}"...`);
            }

            // Determine metadata
            let priority = 'medium';
            if (card.labels.some(l => l.name === 'BUG' || l.name === 'Urgente')) priority = 'high';
            if (card.labels.some(l => l.name === 'MELHORIA')) priority = 'low';

            const payload = {
                organization_id: ORG_ID,
                column_id: targetColumnId,
                title: card.name,
                description: card.desc,
                position: card.pos, // Keep relative position potentially
                priority,
                trello_card_id: card.id,
                due_date: card.due ? new Date(card.due).toISOString() : null,
                labels: card.labels.map(l => l.name),
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('kanban_cards')
                .upsert(payload, { onConflict: 'trello_card_id' }); // Assuming unique constraint or logic

            if (error) {
                console.error(`Failed to insert "${card.name}":`, error);
            } else {
                importedCount++;
            }
        }

        console.log('--- Import Complete ---');
        console.log(`Imported/Updated: ${importedCount}`);
        console.log(`Skipped (Unmapped Lists): ${skippedCount}`);

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

importCards();

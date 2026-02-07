
import { env } from 'process';
import fs from 'fs';
import path from 'path';

// Helper to load env file
function loadEnv(filePath: string) {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
                process.env[key] = value;
            }
        });
    }
}

// Load envs
const rootDir = path.resolve(__dirname, '..');
loadEnv(path.join(rootDir, '.env.local'));
loadEnv(path.join(rootDir, '.env'));

const API_KEY = process.env.TRELLO_API_KEY;
const TOKEN = process.env.TRELLO_TOKEN;

if (!API_KEY || !TOKEN) {
    console.error('Missing TRELLO_API_KEY or TRELLO_TOKEN in .env or .env.local');
    process.exit(1);
}

async function findBoard() {
    try {
        const response = await fetch(`https://api.trello.com/1/members/me/boards?key=${API_KEY}&token=${TOKEN}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch boards: ${response.statusText}`);
        }
        const boards = await response.json() as any[];

        // Search for Adega or Anita
        const adegaBoard = boards.find((b: any) =>
            b.name.toLowerCase().includes('adega') ||
            b.name.toLowerCase().includes('anita')
        );

        if (adegaBoard) {
            console.log(`Found Board: ${adegaBoard.name} (ID: ${adegaBoard.id})`);

            // Fetch lists
            const listsResponse = await fetch(`https://api.trello.com/1/boards/${adegaBoard.id}/lists?key=${API_KEY}&token=${TOKEN}`);
            if (!listsResponse.ok) {
                throw new Error(`Failed to fetch lists: ${listsResponse.statusText}`);
            }
            const lists = await listsResponse.json() as any[];

            console.log('Lists (Columns):');
            lists.forEach((l: any) => {
                console.log(`- ${l.name} (ID: ${l.id})`);
            });

        } else {
            console.log('Board "Adega Anita" not found.');
            console.log('Available boards:', boards.map(b => b.name).join(', '));
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

findBoard();

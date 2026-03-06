import { createClient } from '@supabase/supabase-js';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.replace(/['"]/g, '').trim();

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
  console.error('Missing env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function getEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent({
    content: { role: 'user', parts: [{ text }] },
    outputDimensionality: 768,
  } as any);
  return result.embedding.values;
}

async function ingestWikiPages() {
  // Find wiki_pages that have NO chunks in wiki_embeddings yet
  const { data: pages, error: pagesError } = await supabase
    .from('wiki_pages')
    .select('id, title, content');

  if (pagesError || !pages) {
    console.error('Failed to fetch wiki_pages:', pagesError);
    return;
  }

  const { data: existingChunks, error: chunksError } = await supabase
    .from('wiki_embeddings')
    .select('page_id');

  if (chunksError) {
    console.error('Failed to fetch wiki_embeddings:', chunksError);
    return;
  }

  const pagesWithChunks = new Set(existingChunks?.map((c) => c.page_id) ?? []);
  const pagesToIngest = pages.filter((p) => !pagesWithChunks.has(p.id));

  if (pagesToIngest.length === 0) {
    console.log('All wiki_pages already have embeddings. Nothing to do.');
    return;
  }

  console.log(`Found ${pagesToIngest.length} pages without embeddings.\n`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 150,
    separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ', ''],
  });

  for (const page of pagesToIngest) {
    console.log(`Processing: ${page.title}`);

    if (!page.content || page.content.trim().length === 0) {
      console.log(`  Skipped (empty content)\n`);
      continue;
    }

    const chunks = await splitter.createDocuments([page.content.trim()]);
    console.log(`  Split into ${chunks.length} chunks`);

    let inserted = 0;
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i].pageContent;
      try {
        const vector = await getEmbedding(chunkText);

        const { error: insertError } = await supabase.from('wiki_embeddings').insert({
          page_id: page.id,
          chunk_index: i,
          chunk_text: chunkText,
          embedding: vector,
        });

        if (insertError) {
          console.error(`  Failed chunk ${i}:`, insertError);
        } else {
          inserted++;
        }
      } catch (e) {
        console.error(`  Embedding error chunk ${i}:`, e);
      }
    }

    console.log(`  Inserted ${inserted}/${chunks.length} chunks\n`);
  }

  console.log('Done.');
}

ingestWikiPages().catch((e) => console.error('Fatal error:', e));

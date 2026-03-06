import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.replace(/['"]/g, '').trim();

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
    console.error("❌ Faltam variáveis de ambiente (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ou GEMINI_API_KEY).");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function getEmbedding(text: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent({
        content: { role: "user", parts: [{ text }] },
        outputDimensionality: 768
    } as any);
    return result.embedding.values;
}

async function ingest() {
    const transcricoesDir = path.join(process.cwd(), 'transcricoes');
    if (!fs.existsSync(transcricoesDir)) {
        console.error("📭 Pasta 'transcricoes/' não encontrada.");
        return;
    }

    const arquivos = fs.readdirSync(transcricoesDir).filter(f => f.endsWith('.txt'));
    if (arquivos.length === 0) {
        console.error("📭 Nenhum arquivo .txt encontrado em 'transcricoes/'.");
        return;
    }

    // 1. Pega a primeira organização disponível para vincular as páginas
    const { data: orgs, error: orgError } = await supabase.from('organizations').select('id').limit(1);
    if (orgError || !orgs || orgs.length === 0) {
        console.error("❌ Não foi possível encontrar uma organization_id para vincular os dados.", orgError);
        return;
    }
    const orgId = orgs[0].id;

    // 2. Configura o LangChain Text Splitter
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 150,
        separators: [
            "\n\n",
            "\n",
            ". ",
            "! ",
            "? ",
            "; ",
            ", ",
            " ",
            "",
        ],
    });

    console.log(`📂 Encontrados ${arquivos.length} arquivos para ingestão.`);

    for (const arquivo of arquivos) {
        console.log(`\n🚀 Processando: ${arquivo}...`);
        const filePath = path.join(transcricoesDir, arquivo);
        let originalText = fs.readFileSync(filePath, 'utf-8');

        // Limpeza: remove marcações "```" e normaliza quebras de linha múltiplas
        let cleanText = originalText.replace(/```[a-z]*\nn|```/g, '');
        cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();

        // 3. Verifica ou cria a página na wiki_pages (que funciona como nosso group/metadata)
        // O slug precisa ser amigável.
        const title = arquivo.replace('.txt', '');
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        let { data: page, error: pageError } = await supabase
            .from('wiki_pages')
            .select('id')
            .eq('slug', slug)
            .eq('organization_id', orgId)
            .single();

        if (!page) {
            const { data: newPage, error: createError } = await supabase
                .from('wiki_pages')
                .insert({
                    organization_id: orgId,
                    title: title,
                    slug: slug,
                    content: `Transcrição importada da aula: ${title}`,
                    category: 'strategy' // Categoria genérica para conhecimento AI
                })
                .select()
                .single();

            if (createError) {
                console.error(`❌ Erro ao criar wiki_page para ${arquivo}:`, createError);
                continue;
            }
            page = newPage;
        } else {
            // Se a página já existe, apaga embeddings antigos associados a ela para refazer
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            await supabase.from('wiki_embeddings').delete().eq('page_id', page!.id);
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const pageId = page!.id;

        // 4. Chunking (dividindo o texto estrategicamente)
        const chunks = await splitter.createDocuments([cleanText]);
        console.log(`   ✂️ Texto dividido em ${chunks.length} blocos.`);

        // 5. Gera embeddings e salva no Supabase (wiki_embeddings)
        let blocosInseridos = 0;
        for (let i = 0; i < chunks.length; i++) {
            const chunkText = chunks[i].pageContent;
            try {
                const vector = await getEmbedding(chunkText);

                // Inserimos na tabela apropriada do kOS que tem suporte a vetores (wiki_embeddings)
                // Aqui associamos ao page_id criado e guardamos o chunk
                const { error: insertError } = await supabase.from('wiki_embeddings').insert({
                    page_id: pageId,
                    chunk_index: i,
                    chunk_text: chunkText,
                    embedding: vector
                });

                if (insertError) {
                    console.error(`   ❌ Erro ao inserir bloco ${i}:`, insertError);
                } else {
                    console.log(`   ✅ Bloco ${i} inserido com sucesso!`);
                    blocosInseridos++;
                }
            } catch (e) {
                console.error(`   ⚠️ Erro ao processar embedding do bloco ${i}:`, e);
            }
        }

        console.log(`✅ Sucesso! ${blocosInseridos}/${chunks.length} blocos inseridos no banco para o arquivo '${arquivo}'.`);
    }

    console.log("\n🏁 Ingestão concluída com sucesso!");
}

ingest().catch(e => console.error("Erro fatal:", e));

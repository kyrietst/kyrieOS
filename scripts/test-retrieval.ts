import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function testSearch() {
    const geminiKey = process.env.GEMINI_API_KEY!.replace(/['"]/g, '').trim();
    const genAI = new GoogleGenerativeAI(geminiKey);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Pergunta de teste baseada no conteúdo da Aula 01
    const query = "Qual o diferencial do Growth Advisor sobre negócios locais?";

    console.log(`🔍 Testando busca para: "${query}"`);

    // 1. Gera o embedding da pergunta (mesmo processo da ingestão)
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent({
        content: { role: 'user', parts: [{ text: query }] },
        outputDimensionality: 768
    } as any);
    const embedding = result.embedding.values;

    // 2. Chama a função de busca no Supabase (RPC)
    // Nota: Estou assumindo que a função se chama 'match_wiki_pages' ou 'match_wiki_sections' e o parâmetro do texto é 'chunk_text'.
    // Ajustei para corresponder ao schema real.
    const { data, error } = await supabase.rpc('match_wiki_embeddings', {
        query_embedding: embedding,
        match_threshold: -100.0,
        match_count: 5
    });

    if (error) {
        if (error.message.includes('Could not find the function')) {
            console.error("❌ Função RPC 'match_wiki_embeddings' não encontrada no banco. Talvez ela se chame diferente?");
        } else {
            console.error("❌ Erro na busca:", error);
        }
        return;
    }

    if (!data || data.length === 0) {
        console.log(`✅ Busca concluída, mas nenhum resultado atingiu o threshold.`);
        return;
    }

    console.log(`✅ Encontrados ${(data as any).length} resultados relevantes:`);
    (data as any).forEach((res: any, i: number) => {
        console.log(`\n[Resultado ${i + 1}] (Similaridade: ${(res.similarity * 100).toFixed(2)}%)`);
        // Usando chunk_text pois é o nome correto da coluna
        const content = res.chunk_text || res.content;
        if (content) {
            console.log(content.substring(0, 200) + "...");
        } else {
            console.dir(res);
        }
    });

    process.exit(0);
}

testSearch();

# 🔍 BROWNFIELD AUDIT — kyrieOS

## CONTEXTO

Estamos preparando o kyrieOS para a próxima fase: implementação do sistema multi-agentes de IA (memória, RAG, LangGraph). Antes de construir em cima, precisamos garantir que a fundação está sólida.

**REGRA DE OURO:** O módulo Kanban (18 componentes + 10 tabelas) é a funcionalidade mais trabalhada e refinada do projeto. Foi cuidadosamente modelado para replicar a experiência do Trello. **NÃO sugira reescrever, refatorar ou redesenhar o Kanban.** Identifique apenas problemas REAIS que causam bugs ou bloqueiam evolução (ex: type safety issue que quebra build, dependência circular, Server Action sem error handling). Componentes grandes no Kanban são aceitáveis se funcionam — eles ficam grandes porque fazem muita coisa por design.

**O que QUEREMOS saber:**
1. O que está QUEBRADO ou inconsistente
2. O que é LIXO e pode ser removido com segurança
3. O que BLOQUEIA a implementação do módulo AI
4. Quick wins de qualidade (5 min de fix, alto impacto)
5. Gaps de segurança reais (não teóricos)

**O que NÃO queremos:**
- Sugestões de refatoração estética
- "Poderia ser melhor se..." sem problema concreto
- Reescrever o que funciona

---

## PARTE 1: ANÁLISE DE CÓDIGO (Filesystem)

### 1.1 — Arquivo lixo confirmado

Leia e confirme que `temp_original.tsx` na raiz é realmente descartável:

```bash
head -30 temp_original.tsx
wc -l temp_original.tsx
```

Diga claramente: "Pode deletar com segurança" ou "Contém código referenciado por [X]".

### 1.2 — Scripts legados do Trello

Leia os scripts Trello e avalie se ainda são usados:

```bash
cat scripts/find_trello_board.ts
```

Verifique se existe alguma referência a esses scripts no código de produção:

```bash
grep -r "find_trello_board\|trello" --include="*.ts" --include="*.tsx" -l | grep -v node_modules | grep -v scripts/ | grep -v .next
```

Resultado esperado: "Scripts Trello podem ser removidos" ou "Ainda referenciados em [arquivo]".

### 1.3 — Docs obsoletos ou redundantes

```bash
ls -la docs/
```

Liste quantos docs existem e identifique se há PRDs antigos, drafts abandonados, ou arquivos que contradizem o estado atual do projeto.

### 1.4 — Server Actions — Análise de qualidade

Para CADA arquivo em `actions/`, analise:

```bash
for f in actions/*.ts; do echo "=== $f ===" && wc -l "$f" && grep -c "\.error" "$f" && grep -c "revalidatePath\|revalidateTag" "$f" && grep -c "'use server'" "$f"; done
```

Depois leia cada arquivo e reporte:

| Action | Linhas | Error Handling | Revalidation | 'use server' | Problemas |
|--------|--------|----------------|--------------|--------------|-----------|

Problemas a buscar:
- Supabase calls sem `.error` check
- Server Action sem `'use server'` no topo
- Mutations sem `revalidatePath()` (UI não atualiza)
- Dados retornados sem tipagem (retorna `any` implícito)
- Try/catch genéricos que engolem erros

### 1.5 — Types — Cobertura e qualidade

```bash
cat types/kanban.ts
```

```bash
find types/ -name "*.ts" | xargs cat
```

Verifique:
- Os tipos cobrem todas as 27 tabelas ou só algumas?
- Existem tipos duplicados ou inconsistentes com o schema real?
- Existem tipos gerados automaticamente via Supabase CLI (`database.types.ts`)?
- Os tipos do Kanban refletem as 35 colunas de `kanban_cards`?

### 1.6 — AI Module — Estado atual

Leia os 2 componentes AI e o backend:

```bash
cat components/ai/ChatInterface.tsx
```

```bash
cat actions/ai.ts
```

```bash
cat api/main.py
```

```bash
cat api/graphs/report_generator.py
```

```bash
cat api/requirements.txt
```

Reporte:
- O ChatInterface funciona? Está conectado ao FastAPI?
- O `actions/ai.ts` faz o quê exatamente? Conversa com Supabase? Com FastAPI? Com LLM direto?
- O `api/main.py` tem CORS configurado? Tem rotas de saúde (health check)?
- O `report_generator.py` usa LangGraph corretamente? Quais nodes/edges existem?
- O `requirements.txt` tem todas as deps necessárias? Faltam deps pro que pretendemos (langchain, chromadb, etc)?
- Existe algum conflito de versão?

### 1.7 — Hooks e Contexts

```bash
cat contexts/*.tsx contexts/*.ts 2>/dev/null
cat hooks/*.tsx hooks/*.ts 2>/dev/null
```

- O que cada contexto faz?
- Os hooks são usados? Verifique referências:

```bash
for h in hooks/*; do name=$(basename "$h" .ts | sed 's/.tsx//'); grep -rl "$name" --include="*.tsx" --include="*.ts" components/ app/ | grep -v node_modules; done
```

### 1.8 — Imports mortos e dependências não usadas

```bash
# Procure imports de pacotes do package.json que podem não estar sendo usados
for pkg in "canvas-confetti" "resend" "react-dropzone" "cmdk" "react-big-calendar"; do
  echo "=== $pkg ===" 
  grep -r "$pkg" --include="*.ts" --include="*.tsx" -l | grep -v node_modules | grep -v package
done
```

### 1.9 — next.config.ts

```bash
cat next.config.ts
```

Confirme se está vazio e liste o que DEVERIA ter configurado para o kOS funcionar corretamente (remotePatterns para Supabase Storage, headers de segurança, etc).

### 1.10 — Design System

```bash
cat design-system/*
```

O que existe aqui? Está sendo usado ou é abandonado?

---

## PARTE 2: ANÁLISE DO SUPABASE (via MCP)

### 2.1 — Tabelas sem uso no código

Para cada tabela que NÃO é do Kanban, verifique se existe Server Action ou componente que a utiliza:

```bash
for table in "activities" "approval_history" "approvals" "business_metrics" "client_health" "inbox_items" "notifications" "reports" "tasks" "time_entries"; do
  echo "=== $table ==="
  grep -r "$table" --include="*.ts" --include="*.tsx" actions/ components/ app/ | grep -v node_modules | head -5
done
```

Se alguma tabela tem 0 referências no código: é um schema criado mas nunca integrado.

### 2.2 — Policies duplicadas (confirmar detalhes)

Execute via MCP:

```sql
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('business_metrics', 'client_health')
ORDER BY tablename, policyname;
```

Identifique exatamente quais policies são redundantes e proponha quais REMOVER (sem executar).

### 2.3 — View capacity_burn_down_view

```sql
SELECT * FROM information_schema.views
WHERE table_name = 'capacity_burn_down_view'
AND table_schema = 'public';
```

Essa view está sendo usada no código?

```bash
grep -r "capacity_burn_down" --include="*.ts" --include="*.tsx" -r | grep -v node_modules
```

Se não está sendo usada: marcar para remoção.

### 2.4 — Seed data migration

A migration #8 é `seed_data`. Leia-a:

```bash
cat supabase/migrations/*seed_data*
```

O banco está vazio (0 rows em todas as tabelas). O seed roda automaticamente ou precisa ser executado manualmente? Isso é intencional ou o seed falhou?

### 2.5 — Storage Buckets

Execute via MCP:

```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets;
```

Confirme que o bucket `card-covers` existe e tem as permissões corretas. Verifique se existem policies de storage:

```sql
SELECT * FROM storage.objects LIMIT 1;
```

---

## PARTE 3: BUILD & RUNTIME

### 3.1 — Build check

```bash
npx tsc --noEmit 2>&1 | head -50
```

Se há erros de TypeScript, liste TODOS. Se zero: confirme.

### 3.2 — Lint

```bash
npx next lint 2>&1 | head -50
```

### 3.3 — Dependências desatualizadas ou com vulnerabilidades

```bash
npm audit --production 2>&1 | tail -20
```

### 3.4 — Tamanho do bundle (se build funciona)

```bash
npm run build 2>&1 | tail -30
```

Capture o output de tamanho das rotas.

---

## PARTE 4: FORMATO DO RELATÓRIO

Organize assim:

```markdown
# 🏗️ BROWNFIELD AUDIT — kyrieOS — [DATA]

## RESUMO EXECUTIVO
- Total de issues encontradas: X
- 🔴 Críticas (bloqueiam evolução): X
- 🟡 Médias (melhoram qualidade): X  
- 🟢 Quick Wins (5 min de fix): X
- 🗑️ Lixo para remover: X items

## 🗑️ REMOÇÕES SEGURAS
[Lista de arquivos/configs que podem ser deletados com segurança]

## 🔴 ISSUES CRÍTICAS
[Issues que bloqueiam a implementação do módulo AI ou causam problemas reais]

## 🟡 ISSUES MÉDIAS
[Melhorias de qualidade que devem ser feitas antes de adicionar complexidade]

## 🟢 QUICK WINS
[Coisas que levam <5 min e melhoram a saúde do projeto]

## 📊 SERVER ACTIONS — SCORECARD
[Tabela com avaliação de cada Server Action]

## 🤖 AI MODULE — READINESS ASSESSMENT
[Estado atual do módulo AI e o que falta para começar a implementação dos agentes]

## 🐘 SUPABASE — CLEANUP OPPORTUNITIES
[Policies duplicadas, views não usadas, tabelas sem integração no código]

## 🏗️ BUILD & TYPE SAFETY
[Resultado do tsc --noEmit, next lint, npm audit]

## 📋 PLANO DE AÇÃO SUGERIDO
[Ordenado por prioridade: o que fazer primeiro, segundo, terceiro]
[Cada item com estimativa de tempo]
```

**LEMBRETE FINAL:** 
- O Kanban FUNCIONA e FOI TESTADO. Não sugira refatorar KanbanCardDetails, KanbanBoard, ou qualquer componente Kanban que esteja funcionando. Se encontrar um BUG real (type error, crash, data leak), aí sim reporte.
- Foco no que BLOQUEIA o próximo passo (módulo AI) e no que é LIXO seguro de remover.
- Retorne o relatório completo. Não omita resultados.

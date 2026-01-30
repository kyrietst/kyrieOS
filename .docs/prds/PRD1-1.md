# 🛠️ PRD: KYRIE OS - INTEGRAÇÃO E VIDA (MVP 1.1)

## 1. VISÃO GERAL

Este documento orienta a transição do estado **Mock/Estático** para o estado
**Funcional/Dinâmico**, substituindo integrações externas de terceiros
(Clockify) por um módulo de rastreamento nativo.

---

## 2. O NOVO MÓDULO: KYRIE TIME TRACKER (NATIVO)

Para eliminar a dependência da API do Clockify e simplificar o workflow, o
sistema terá seu próprio cronômetro.

### 2.1 Especificações Técnicas

- **Tabela de Banco:** Criar `time_entries` no Supabase vinculada a `task_id` e
  `user_id`.
- **Componente Global:** Um cronômetro persistente no Header ou Sidebar que
  permite:
- Iniciar/Pausar tempo em uma tarefa selecionada.
- Edição manual de horas.

- **Vantagem:** Dados estruturados prontos para o LangGraph consumir sem
  latência de rede externa.

---

## 3. A PARTE CRÍTICA: "CONEXÃO TOTAL"

### 3.1 Substituição de Dados Mockados (Hardcoded → Supabase)

- **Admin Dashboard:** Alterar os cards de MRR, Projetos e Saúde do Cliente para
  consumirem a tabela `organizations` e `projects` real.
- **Tabela de Clientes:** Implementar `useSWR` ou `React Query` para buscar
  dados de `/app/kyrie/clients/page.tsx` diretamente do banco.
- **RLS (Row Level Security):** Testar e validar que o Cliente A nunca verá os
  dados da Adega Anita's.

### 3.2 Evolução do LangGraph (Fake → Real)

- **Motor Real:** Migrar a implementação "lite" para a biblioteca
  `@langchain/langgraph` oficial no Python.
- **OpenAI Real:** Ativar a `OPENAI_API_KEY` para que o nó `generate_report`
  interprete os dados reais de tempo e métricas.
- **Memória do Agente:** Permitir que o agente lembre do relatório da semana
  anterior para comparar resultados.

---

## 4. PORTAL DO CLIENTE (O QUE FALTA)

O foco agora é a transparência total:

- **Arquivo de Relatórios:** Criar a visualização de histórico onde o cliente
  pode ver os PDFs/Markdowns gerados nas semanas passadas.
- **ROI Tracker Visual:** Implementar gráficos reais usando `recharts` que
  mostram a curva de investimento vs. lucro baseada nos dados do Google Sheets
  (única API externa mantida para flexibilidade do cliente).
- **Fila de Aprovação:** Sistema simples de "Aprovar/Rejeitar" para entregáveis
  (criativos, copies, estratégias).

---

## 5. ROADMAP DE EXECUÇÃO IMEDIATA (VIBE CODING)

### Fase 1: O "Coração" (Dados)

- [x] **DB:** Rodar migration para a tabela `time_entries` (Feito).
- [x] **UI Admin:** Criar o componente de Cronômetro no layout base (Feito).
- [x] **Data Fetching:** Conectar `client-table.tsx` ao banco real (Feito).

### Fase 2: O "Cérebro" (IA)

- [x] **API:** Atualizar `api/main.py` para buscar dados da nova tabela
      `time_entries`.
- [x] **Modelo AI:** Substituído OpenAI por **Google Gemini** (Free Tier) para
      geração de relatórios.
- [ ] **Prompting:** Refinar o prompt do agente para análise de performance de
      marketing real.

### Fase 3: A "Entrega" (Cliente)

- [ ] **Portal:** Desenvolver a página de "Histórico de Relatórios".
- [ ] **Segurança:** Validar RLS para garantir que o Portal do Cliente esteja
      blindado.

---

## 6. SUCESSO DO MVP 1.1

O sucesso será atingido quando:

1. Gilmar puder iniciar um cronômetro no sistema e, ao final da semana, clicar
   em um botão para a IA gerar um relatório baseado **naquele tempo
   registrado**.
2. O cliente da Adega Anita's puder logar e ver o gráfico de ROI subindo com
   dados reais.

---

# 📋 Feature Documentation: Master Kanban & Card Details

**Versão:** 1.3 (High-Fidelity & Real-time)
**Data:** 13 de Fevereiro de 2026
**Status:** Implementado ✅

---

## 1. Visão Geral

O **Master Kanban** é uma funcionalidade centralizada no Kyrie OS que permite a visualização e gestão unificada de tarefas de **todas as organizações/clientes** em um único quadro. Além disso, introduzimos uma experiência de **Detalhes do Cartão** de alta fidelidade, inspirada no Trello/Notion.

### 📍 Localização
- **Rota:** `/kyrie/workspace/kanban`
- **Acesso:** Menu Lateral > Workspace > Kanban Geral

---

### 2.1 Infraestrutura Ultimate (Colunas Padronizadas)
O Master Kanban agora utiliza a infraestrutura **Ultimate**, que padroniza o fluxo de trabalho em todas as organizações:
- **12 Status Globais**: Colunas pré-definidas (ex: INFO CLIENTES, IDEIAS, AGENDADO, EM ANDAMENTO, CONCLUÍDO) que garantem consistência.
- **Sincronização Automática**: Qualquer ajuste nas colunas globais é replicado instantaneamente para todos os clientes via triggers de banco de dados (`sync_kanban_columns_to_all_orgs`).
- **Segurança RLS**: Somente `KYRIE_ADMIN` pode modificar a estrutura global, enquanto clientes têm visão otimizada de seus próprios cartões dentro desses status.

### 2.2 Movimentação Híbrida (Drag-and-Drop)
Implementamos uma lógica de movimentação que resolve a discrepância entre Colunas Globais e Locais:
- **Tradução de Status**: Ao mover um card entre colunas globais no Master View, o sistema identifica automaticamente a coluna local correspondente na organização do cliente.
- **Persistência Local**: O card é movido para a coluna local correta, mantendo o fluxo do cliente íntegro.
- **Identificação (Badges)**: Cada cartão possui um **Badge** com a sigla e cor do cliente (ex: `[ADE]` Vermelho).

---

## 3. Detalhes do Cartão (Novo UX)

Implementamos um modal de **Visualização e Edição** robusto, substituindo os antigos formulários simples.

### 3.1 Cabeçalho de Navegação (Trello-like)
Uma barra superior dedicada para controles de janela e navegação:
- **Navegação (Esquerda):**
    - Botão com Nome da Coluna (ex: "Em Execução").
    - **Popover "Mover Cartão":** Permite mover a tarefa para outra lista ou quadro rapidamente.
- **Controles (Direita):**
    - **Seguir (Megafone):** Para receber notificações.
    - **Capa (Imagem):** Seletor de cores para a capa do cartão.
    - **Mais (...):** Menu com opções de Mover, Copiar, Arquivar.
    - **Fechar (X):** Encerra o modal.

### 3.4 Sistema de Capas Premium (Trello-Style)
Refinamos o sistema de capas para máxima fidelidade visual:
- **Modos de Visualização:**
    - **Banner (Header):** A imagem ou cor ocupa o topo do cartão.
    - **Capa (Full):** O cartão inteiro é preenchido pela cor ou imagem, com o título posicionado no canto inferior esquerdo.
- **Seletor Inteligente:**
    - Botões de seleção agora mostram **Card Skeletons** para pré-visualização realística.
    - Suporte para cores sólidas e imagens de anexos.
- **Contraste de Texto:**
    - Opções **Claro** e **Escuro** para o título, garantindo legibilidade sobre qualquer fundo.
    - Indicador de seleção (círculo) que aparece no hover, respeitando o tema de cor escolhido.

### 3.2 Conteúdo Rico
- **Título Editável:** Input grande e clean, editável in-place.
- **Barra de Ações:** Botões rápidos para adicionar Membros, Etiquetas, Checklist, Datas, Anexos.
- **Descrição Inteligente:** 
    - Textarea com **Auto-Resize** (cresce conforma o texto).
    - Suporte visual para markdown básico.
    - Modo de Leitura vs. Modo de Edição.

### 3.3 Atividade e Comentários
- **Sidebar Direita:** Área dedicada para histórico e comunicação.
- **Timeline:** Registra quem moveu, editou ou comentou.
- **Input de Comentário:** Campo de texto para interação da equipe.

### 3.5 Upload & Anexos
- **Tab Dedicada:** Nova aba "Anexos & Upload" no seletor de capas.
- **Drag & Drop:** Área de dropzone interativa para upload intuitivo.
- **Armazenamento:** Arquivos salvos no bucket `card-covers` do Supabase Storage.
- **Organização:** Estrutura de pastas `orgId/cardId/filename` para manter a higiene do storage.

---

## 4. Reatividade em Tempo Real (Sync)

Implementamos um motor de sincronização para eliminar a necessidade de refresh (F5):
- **Prop-State Synchronization**: Componentes de board sincronizam o estado React com as props do servidor instantaneamente após mutações.
- **Supabase Realtime**: O board escuta mudanças na tabela `kanban_cards`. Mudanças feitas por outros usuários ou abas são refletidas automaticamente via `router.refresh`.
- **Feedback Instantâneo**: Atualizações de capa, títulos e posições são refletidas em milissegundos.

---

## 4. Quick Actions (Criação Rápida)

### 4.1 Inline Add
- Criação de tarefas direto na coluna, sem abrir modal.
- `Enter` para salvar, `Esc` para cancelar.
- **Dropdown de Cliente:** No Master Kanban, permite escolher para qual cliente a tarefa vai.

---

## 5. Arquitetura Técnica

### 5.1 Componentes Chave
- `KanbanCardDetails.tsx`: O novo modal gigante. Usa `Dialog` do Shadcn, `Popover` para menus e `useState` para edição local.
- `KanbanCard.tsx`: Cartão do board. Otimizado para performance de renderização.
- `useMasterKanban.ts`: Hook que orquestra a busca cross-tenant.

### 5.2 Server Actions
- `updateCardDetails`: Atualiza título e descrição parcialmente.
- `createKanbanCard`: Lida com a criação multi-tenant.

---

## 6. Refinamentos Visuais (Polimento V1-V6)

O Kanban passou por um processo rigoroso de refinamento visual ("Apple-like") para garantir imersão:

### 6.1 Filosofia "Borderless"
- **Sem Bordas Físicas**: Removemos `border-width: 1px` que criava artefatos em fundos escuros/gradientes.
- **Ring Hover**: Utilizamos `ring-1` (box-shadow) para o efeito de hover branco, evitando mudanças de layout.
- **Corner Protection**: Cards com capa cheia usam `bg-transparent` para evitar que o fundo do card "sangre" pelas bordas arredondadas.

### 6.2 Densidade de Informação
- **Typography**: Títulos reduzidos para 15px com `leading-tight`.
- **Min-Height:** Capas padronizadas em ~150px para compensar a falta de padding externo.
- **Padding/Gap:** 
    - Removidos padding e gaps padrão do container (`!p-0 !gap-0`).
    - Padding inferior ajustado (`!pb-1.5`) para manter o título próximo à borda (Estilo Trello).

---

- [x] Refinar modo "Capa" (Full) com título e hover indicators.
- [x] Implementar sincronização real-time com Supabase.
- [x] Upload real de anexos (Supabase Storage).
- [ ] Persistir comentários no banco de dados (`task_comments`).

# 📋 Feature Documentation: Master Kanban & Card Details

**Versão:** 1.2 (High-Fidelity)
**Data:** 01 de Fevereiro de 2026
**Status:** Implementado ✅

---

## 1. Visão Geral

O **Master Kanban** é uma funcionalidade centralizada no Kyrie OS que permite a visualização e gestão unificada de tarefas de **todas as organizações/clientes** em um único quadro. Além disso, introduzimos uma experiência de **Detalhes do Cartão** de alta fidelidade, inspirada no Trello/Notion.

### 📍 Localização
- **Rota:** `/kyrie/workspace/kanban`
- **Acesso:** Menu Lateral > Workspace > Kanban Geral

---

## 2. Master Kanban (Visão Agregada)

### 2.1 Colunas Globais e Virtuais
- **Visualização Unificada:** Agrega cartões de todos os clientes em colunas comuns ("A Fazer", "Em Progresso", "Concluído").
- **Gerenciamento Global:** Criar uma coluna no Master Kanban propaga essa coluna para **todos** os quadros dos clientes automaticamente.

### 2.2 Identificação (Badges)
- Cada cartão possui um **Badge** com a sigla e cor do cliente (ex: `[ADE]` Vermelho).
- Permite rápida identificação visual da origem da tarefa.

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

## 6. Próximos Passos
- [ ] Implementar upload real de anexos (Supabase Storage).
- [ ] Persistir comentários no banco de dados (`task_comments`).
- [ ] Tornar o checklist funcional (atualmente visual).

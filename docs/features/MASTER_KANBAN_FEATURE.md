# 📋 Feature Documentation: Master Kanban & Card Details

**Versão:** 3.0 (Pin, Covers & Optimistic Updates)
**Data:** 14 de Fevereiro de 2026
**Status:** Implementado ✅

---

## 1. Visão Geral

O **Master Kanban** é uma funcionalidade centralizada no Kyrie OS que permite a visualização e gestão unificada de tarefas de **todas as organizações/clientes** em um único quadro de alta performance.

### 📍 Localização
- **Rota:** `/kyrie/workspace/kanban`
- **Acesso:** Menu Lateral > Workspace > Kanban Geral

---

## 2. Infraestrutura Ultimate (12 Colunas Globais)

Adotamos uma estrutura padronizada de 12 colunas para garantir consistência operacional em todos os clientes.

### 2.1 Colunas Padrão
1.  **INFO / CLIENTES**: Informações gerais e onboarding.
2.  **IDEIAS / BACKLOG**: Repositório de sugestões e tarefas futuras.
3.  **AGENDADO**: Tarefas com data marcada.
4.  **REUNIÃO**: Cards relacionados a calls e alinhamentos.
5.  **EM ANDAMENTO (DOING)**: Onde o trabalho acontece.
6.  **EM PAUSA / BLOCK**: Tarefas travadas por dependências.
7.  **REVISÃO INTERNA**: Controle de qualidade da equipe.
8.  **APROVAÇÃO CLIENTE**: Aguardando "Ok" do cliente.
9.  **ALTERAÇÕES**: Solicitações de mudança.
10. **APROVADO / AG. POST**: Pronto para publicação/entrega.
11. **CONCLUÍDO (DONE)**: Finalizado com sucesso.
12. **CANCELADO / ARQUIVADO**: Tarefas abortadas.

### 2.2 Sincronização e Permissions
- **Sync Automático**: Alterações na estrutura global (nomes, posições) via `KYRIE_ADMIN` são replicadas para todos os clientes via Database Triggers.
- **Read-Only Clientes**: Clientes enxergam apenas seus cards e não podem alterar a estrutura das colunas.

---

## 3. Interface & UX (Glassmorphism)

O Kanban recebeu uma reformulação visual completa focada em imersão e estética "Apple-like".

### 3.1 Scrollbars Glassmorphic
- Introduzimos scrollbars finos, translúcidos e com efeito de desfoque (`backdrop-blur`).
- **Classe Utilitária**: `.glass-scrollbar` (definida em `globals.css`).
- Garante que a barra de rolagem não polua o visual, mesclando-se com o fundo.

### 3.2 Cabeçalho Unificado
- **Busca Centralizada**: Barra de pesquisa global no topo, estilo "Spotlight" (Glassmorphism).
- **Filtros e View Options**: Menus dropdown com efeito de vidro e ícones refinados.
- **Botão Novo Cartão**: Posicionado estrategicamente para fluxo rápido.

---

## 4. Detalhes do Cartão (High-Fidelity)

O modal de detalhes foi transformado em uma experiência "Notion-like/Trello-like".

### 4.1 Header Navegacional
- **Semana/Coluna**: Indicador claro de onde o cartão está.
- **Ações Rápidas**: Mover, Seguir, Arquivar e Fechar, todos com hover states sutis.
- **Capa (Cover) Selector**: Novo seletor com suporte para preview realístico, imagens e cores sólidas.

### 4.2 Layout "Borderless"
- Removemos bordas físicas em favor de sombras e anéis (`ring`) sutis para um visual mais limpo.
- **Bolinha Checkbox**: Substituímos ícones de cartão por um checkbox circular ("Bolinha") para completar tarefas rapidamente.
- **Inputs Transparentes**: Títulos e descrições editáveis se misturam ao fundo quando não focados.

### 4.3 Sistema de Capas
- **Modo Capa (Full)**: A imagem ocupa todo o card, com texto sobreposto (gradiente de proteção para leitura).
- **Modo Banner**: Imagem apenas no topo.
- **Temas de Texto**: Opção de texto Claro/Escuro para garantir contraste em capas personalizadas.

### 4.4 Gerenciador de Etiquetas (Novo)
- **LabelPicker**: Componente dedicado para gestão de tags com UX refinada.
- **Funcionalidades**: Busca em tempo real, Criação Rápida e Toggle Instantâneo.
- **Estilo**: Glassy Pro Max (fundo translúcido com cores mapeadas do banco).
- **Documentação Técnica**: Veja [KANBAN_LABEL_MANAGER.md](./KANBAN_LABEL_MANAGER.md).

---

## 5. Arquitetura Técnica

### 5.1 Componentes Chave
- `KanbanBoard.tsx`: Orquestrador principal (Client Component). Gerencia DndContext e SortableContext.
- `KanbanCardDetails.tsx`: O modal complexo. Gerencia estado local de edição para performance otimista.
- `CardCoverSelector.tsx`: Componente isolado para gestão de uploads e seleção de cores.

### 5.2 Pin Card System
- **Propósito**: Permite fixar cartões importantes no topo da coluna.
- **Visual**: Ícone de Pin azul (rotacionado 45°) ao lado do título.
- **Database**: `is_pinned` (BOOLEAN) + `pinned_at` (TIMESTAMPTZ) em `kanban_cards`.
- **Sorting**: View e RPC ordenam `is_pinned DESC NULLS LAST` → `updated_at DESC`.
- **Menu**: Ação "Fixar no Topo" / "Desafixar" no `KanbanCardMenu`.
- **Optimistic**: Atualização local antes do server, com rollback automático em caso de erro.
- **Animação**: `framer-motion` `layout` prop gera transição suave na reordenação.

### 5.3 Server Actions & Realtime
- **Otimistic UI**: A interface atualiza instantaneamente (ex: arrastar card, fixar/desafixar, trocar nome).
- **Background Sync**: Server Actions (`moveCard`, `updateCardCover`, `toggleCardPin`) persistem os dados.
- **Supabase Realtime**: Listeners escutam mudanças no banco para sincronizar multi-abas/multi-usuários sem refresh.

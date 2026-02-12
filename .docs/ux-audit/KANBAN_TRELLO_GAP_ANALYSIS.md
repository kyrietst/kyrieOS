# 🎨 Audit de UI/UX & Código Frontend: Kanban KyrieOS vs Trello

**Data:** 12 de Fevereiro de 2026
**Autor:** Frontend Specialist Agent
**Contexto:** Migração 100% do Trello para KyrieOS. Backend pronto. Foco em polimento visual ("Butter Smooth").

---

## Executive Summary
**Nota UX Atual:** 7.5/10

O sistema atual tem uma base sólida utilizando tecnologias modernas (`@dnd-kit`, `shadcn/ui`, `tailwindcss`). Funciona bem e é responsivo. No entanto, falta a "alma" do Trello: as micro-interações que tornam o uso satisfatório, a fluidez das animações baseadas em física (spring), e funcionalidades de *power user* (atalhos de teclado, edição rápida). O código, embora limpo, começa a misturar responsabilidades no componente principal (`KanbanBoard`), o que dificultará a manutenção de features complexas futuras.

---

## 1. "Trello Feel" & Micro-interações
| Critério | Estado Atual | Análise |
| :--- | :--- | :--- |
| **Drag & Drop Feedback** | 🟡 Parcial | Usa `DragOverlay` com rotação (`rotate-2`) e opacidade. Bom feedback visual, mas falta a animação de "snap" elástico ao soltar e o destaque inteligente da área de drop (placeholder iluminado). Atualmente a transição é linear CSS ou padrão do dnd-kit. |
| **Fluidez de Animação** | 🔴 Seco | As transições de layout (quando um card sai e os outros sobem) são abruptas ou lineares. Falta `framer-motion` com `layoutId` para que os cards deslizem suavemente para suas novas posições quando a lista muda de tamanho. |
| **Feedback de Conclusão** | 🔴 Inexistente | Ao clicar em concluir, apenas troca o ícone e mostra um Toast. Não há celebração (confetti, som sutil, brilho no card) que recompense o usuário. |
| **Hover States** | 🟢 Decente | `hover:ring-2` e `hover:shadow-md` no Card funcionam bem. |

### 🔧 Recomendação
- Adicionar `framer-motion` para animar a entrada/saída de cards e reordenação de listas (Layout Animations, Reorder.Group).
- Implementar um efeito de "Confetti" sutil ao marcar uma tarefa como pronta (`canvas-confetti`).
- Melhorar o `DragOverlay` com uma sombra (`box-shadow-xl`) mais profunda para dar sensação de elevação (z-index físico).

## 2. Limpeza de Código & Arquitetura
| Componente | Tamanho | Problemas Identificados |
| :--- | :--- | :--- |
| **`KanbanBoard.tsx`** | ~450 linhas | Componente monolítico. Contém definições de `SortableCard` e `SortableColumn` internamente. Mistura lógica de negócio ("Master View" vs "Client View") com lógica de UI. |
| **`KanbanCard.tsx`** | ~260 linhas | Lógica de renderização de Labels é muito complexa e mistura estilos inline/Tailwind hardcoded. Deveria ser extraída para `KanbanLabels.tsx`. A geração de cores aleatórias para organizações no render (`Math.abs(hash)`) pode causar *hydration mismatch*. |
| **Estilos Hardcoded** | ⚠️ Alerta | Encontrados valores hex/classes específicas como `bg-blue-50/50` e listas de cores (`bg-red-500`, etc) que podem quebrar o tema ou Dark Mode se não auditados. |

### 🔧 Recomendação Refatoração
1.  **Extrair Componentes:** Mover `SortableColumn` e `SortableCard` para arquivos próprios em `components/kanban/dnd/`.
2.  **Hook de Lógica:** Criar `useKanbanController.ts` para abstrair toda a lógica de `onDragEnd` e `handleDragOver`.
3.  **Label System:** Padronizar as cores das labels em um objeto de configuração (`const LABEL_COLORS`) e usar variáveis CSS/Tailwind (`bg-primary/20 text-primary`) para garantir consistência em Dark Mode.

## 3. Consistência Visual
- **Design System:** O uso de `shadcn/ui` (`Card`, `Button`, `Input`) garante boa consistência com o resto do app.
- **Dark Mode:** A maioria das cores usa variáveis (`bg-muted`, `text-foreground`), o que é excelente. Ponto de atenção apenas nas labels coloridas e no fundo das colunas "Globais" (`bg-blue-50/50` vs Dark Mode).
- **Acessibilidade:**
    - Botões de ação no card (`Play`, `Check`) têm `title` (tooltip nativo), mas seria melhor usar `Tooltip` do Shadcn para consistência.
    - Tamanho de clique: Botões `h-8 w-8` são aceitáveis, mas o ideal para toque é `h-10 w-10` ou `44px`. O botão "Adicionar cartão" (`KanbanAddCard`) tem boa área de clique.

## 4. Gap Analysis (O que falta para matar o Trello)

### 🚨 Críticos (High Priority)
1.  **Edição Rápida ("Quick Edit")**:
    - **Trello:** Clicar no ícone de lápis (que aparece no hover) abre um editor *in-place* flutuante, sem abrir o modal inteiro.
    - **KyrieOS:** Não existe. Clicar no card abre o modal completo. Não há ícone de lápis visível no card face (embora importado no código).
2.  **Menus de Contexto (Right Click)**:
    - **Estado:** Parcialmente implementado (`KanbanCardMenu.tsx`). Já tem Duplicar, Arquivar, Cor.
    - **Falta:** "Mover" (está desabilitado), "Adicionar Membros" (desabilitado), "Editar Etiquetas" (desabilitado).
3.  **Atalhos de Teclado**:
    - **Estado:** Inexistente.
    - **Falta:**
        - `Space`: Me assignar ao cartão.
        - `c`: Arquivar cartão.
        - `Delete`: Excluir cartão (com confirmação).
        - `l`: Abrir labels.
        - `Esc`: Fechar modais/inputs (já funciona parcialmente nos inputs).

### ⚡ Low Hanging Fruits (Melhorias Rápidas)
- [ ] **Shortcuts Hook:** Implementar `useKeyboardShortcuts` global no Board.
- [ ] **Quick Edit Button:** Adicionar botão de "Lápis" no hover do card que permite editar título rapidamente.
- [ ] **Micro-interação Concluir:** Adicionar efeito de vibração ou brilho verde ao concluir tarefa.
- [ ] **Refatorar Labels:** Criar componente único para Labels que trata tanto Master quanto Client view de forma limpa.

---

## Conclusão
O frontend está 80% do caminho andado. A fundação é sólida. Os 20% restantes são puramente **Refinamento de Interação** e **Funcionalidades de Poder**. Para atingir o "Butter Smooth", precisamos sair do "funcional" para o "delicioso", focando pesadamente em animações de layout e resposta tátil imediata.

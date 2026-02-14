# 🎨 Kyrie OS UI Style Guide (High-Fidelity)

🤖 **Applying knowledge of @frontend-specialist & @mobile-design...**

Este guia define os padrões estéticos e de interação para o Kyrie OS, garantindo que novas funcionalidades mantenham o nível de polimento "Trello-like".

## 1. Princípios de Design

### 👑 O "Toque Trello"
- **Fidelidade Funcional**: Se uma funcionalidade existe (ex: Capa), ela deve se comportar e parecer com a referência líder de mercado.
- **Micro-interações**: Hover states são obrigatórios. Use indicadores sutis (ex: círculos de check que aparecem suavemente) em vez de botões estáticos.
- **Skeletons Reais**: Em seletores (como o de capas), mostre um "mockup" real do que vai acontecer, não apenas ícones ou cores.

### 🚫 A "Purple Ban" (Banimento do Violeta)
- **Regra**: Não utilize tons de roxo/violeta vibrante como cor primária em interfaces de dashboard. 
- **Alternativas**: Use tons de **Zinc**, **Slate**, ou cores de marca específicas (esmeralda, azul profundo) com opacidade controlada.

## 2. Componentes Kanban

### 🧬 Card Skeletons
- Devem incluir linhas de título, metadados (timer, anexos) e indicadores de progresso.
- Usar `animate-pulse` ou `opacity` transitions para feedback de carregamento.

### 🌓 Contraste de Texto
- **Regra de Ouro**: O usuário deve poder escolher o tema do texto (Claro/Escuro) para capas.
- **Claro**: White (`#FFFFFF`)
- **Escuro**: Zinc-900 (`#09090b`)

## 3. Animações (Framer Motion)
- **Damping**: 30
- **Stiffness**: 600
- **Layout Animations**: Sempre use a prop `layout` para movimentos de drag-and-drop suaves.

## 4. Checklist de Qualidade UI
- [ ] O componente respeita o tema de cores?
- [ ] Existe feedback visual no Hover?
- [ ] O espaçamento (padding/gap) segue a escala de 4px?
- [ ] A acessibilidade foi mantida (DialogTitle presente)?

# 🎨 UI Style Guide: Kyrie OS "Borderless" Estética

**Filosofia:** "Apple-like", Imersivo, Limpo.
**Base:** Tailwind CSS + Shadcn UI (Customizado).

---

## 1. Princípios de Design

### 1.1 Borderless (Sem Bordas Físicas)
Evitamos o uso de `border` (1px solid) em componentes de cartão ou modais complexos, pois criam "ruído" visual, especialmente em modo escuro.
- **Antes (Evitar):** `border border-border`
- **Agora (Preferir):** `shadow-sm` ou `ring-1 ring-white/5` (para contraste sutil).

### 1.2 Glassmorphism (Vidro)
Usado para garantir contexto sobre camadas inferiores sem bloquear a visão.
- **Scrollbars:** Use a classe `.glass-scrollbar`.
- **Modais/Dropdowns:** `bg-background/80 backdrop-blur-xl`.
- **Bordas de Vidro:** `border-white/10` para separar sutilmente do fundo.

### 1.3 Micro-Interações
O feedback deve ser imediato e tátil.
- **Hover:** Use `ring-1 ring-primary/20` ou `bg-muted/50` em vez de alterar dimensões.
- **Active:** Botões devem ter `active:scale-95` para sensação de clique físico.

---

## 2. Componentes Kyriales

### 2.1 Scrollbars (.glass-scrollbar)
Scrollbar personalizado fino e translúcido. Adicione a classe ao container com `overflow`.

```tsx
<div className="overflow-y-auto glass-scrollbar">
  {/* Conteúdo */}
</div>
```

### 2.2 Modais (Dialog/Sheet)
Devem parecer flutuar sobre a interface.
- **Overlay:** `bg-black/40 backdrop-blur-[2px]`
- **Content:** `border-none shadow-2xl`

### 2.3 Kanban Cards
- **Padding:** Mínimo. O conteúdo define o espaço.
- **Rounded:** `rounded-lg` ou `rounded-xl`.
- **Corner Protection:** Em cards com imagem full, use `bg-transparent` no container para evitar "sangramento" de pixels brancos nos cantos.

---

## 3. Cores & Temas

O sistema respeita o tema claro/escuro automaticamente via variáveis CSS (`globals.css`).

| Token | Uso |
|-------|-----|
| `bg-background` | Fundo principal da página |
| `bg-muted` | Fundos secundários (colunas, cards inativos) |
| `text-muted-foreground` | Texto de apoio/metadata |
| `ring-primary` | Foco e Ações principais |

---

## 4. Tipografia

- **Font Family:** Inter (Padrão) ou SF Pro (se disponível sistema).
- **Títulos de Cards:** `text-[15px] font-medium leading-tight`.
- **Labels:** `text-xs font-medium text-muted-foreground uppercase tracking-wider`.

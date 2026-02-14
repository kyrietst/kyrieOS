# 🎨 Kyrie OS UI Style Guide

> **Philosophy:** "Premium, Borderless, Native-Feel".
> This guide documents the high-fidelity visual standards established during the Kanban "Ultimate" refactor. All future UI components must adhere to these principles to prevent regression.

---

## 1. Card Design (The "Borderless" Standard)

We moved away from traditional `border: 1px solid` to avoid visual clutter and "boxiness", especially in dark mode.

### ✅ Do:
- **Base:** `!border-0` (No physical border).
- **Interaction:** Use `ring-1 ring-transparent hover:ring-white/60` (or `black/10` in light mode) to indicate interactivity.
- **Shadow:** Minimal `shadow-sm` or none.
- **Background:** `bg-card` for content, `bg-transparent` when using full-cover images.

### ❌ Don't:
- Use `border-border` class on interactive cards (unless strictly necessary for separation).
- Use `hover:border-primary` (too aggressive; prefer rings or background shifts).

```tsx
// Example: KanbanCard.tsx pattern
<Card
    className={cn(
        "group cursor-pointer relative transition-all duration-200",
        "!border-0 ring-1 ring-transparent hover:ring-white/60 shadow-none",
        "overflow-hidden !p-0 !gap-0" // Reset internal padding for full control
    )}
>
```

---

## 2. Density & Spacing

To achieve a "native app" feel, we prioritize density without sacrificing readability.

### ✅ Do:
- **Tight Headers:** Remove default padding from Shadcn Cards (`!p-0`) and manage it via `CardContent`.
- **Min-Height:** Use `min-h-[150px]` for cover cards to ensure impact.
- **Text Alignment:** Push text to the absolute bottom edge (`!pb-1.5`) when using full covers, mimicking Trello/Apple Music style.

---

## 3. Typography

- **Titles:** `text-[15px]` (not 16px, not 14px) offers the best balance of readability and density for cards.
- **Leading:** `leading-tight` or `leading-snug`.
- **Colors:**
    - Primary: `text-foreground` / `text-zinc-900`.
    - Muted: `text-muted-foreground` (approx `zinc-500`).
    - On Dark/Image: `text-white` or `text-white/80`.

---

## 4. Glassmorphism & Overlays

When placing text over images (Full Covers), use gradients and blurs to ensure readability.

### ✅ Do:
- **Scrim:** `bg-gradient-to-t from-black/90 via-black/40 to-transparent`.
- **Badges:** `bg-white/20 backdrop-blur-md` for labels over images.

---

## 5. Interaction Patterns

### Optimistic UI (The "Instant" Feel)
Users should never wait for the server to confirm a visual change.
1. **Update Local State:** `setIsToggling(true)`.
2. **Trigger Animation:** `confetti`, `layout` spring.
3. **Server Action:** Call `updateStatus(...)`.
4. **Revalidation:** `router.refresh()` to sync backend state.
5. **Rollback:** Only if error occurs (toast error).

```tsx
// Pattern
const handleAction = async () => {
    // 1. Optimistic
    setLocalState(newValue);
    // 2. Server
    await serverAction(id, newValue);
    // 3. Sync
    router.refresh();
}
```

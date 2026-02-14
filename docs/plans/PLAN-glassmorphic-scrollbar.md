# Plan: Glassmorphic Scrollbar Styling for CardCoverSelector

## Goal
Implement a modern, "Apple-like" scrollbar with a glassmorphism effect for the `CardCoverSelector` component and potentially globally to ensure UI consistency.

## User Requirements
- **Effect**: Glassmorphism (blur, semi-transparent).
- **Style**: Apple-like (minimalist, thin, overlays).
- **Target**: `CardCoverSelector.tsx` (and implied consistency).

## Proposed Changes

### 1. Global CSS (`app/globals.css`)
Add a new utility class `.glass-scrollbar` (or apply globally to `*`) that customizes `::-webkit-scrollbar`.

```css
@layer utilities {
  .glass-scrollbar {
    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  /* Webkit (Chrome, Edge, Safari) */
  .glass-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .glass-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .glass-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2); /* Dark mode adjustments needed */
    border-radius: 10px;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  
  /* Dark mode specific overrides */
  .dark .glass-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }
  .dark .glass-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}
```

### 2. Update `CardCoverSelector.tsx`
Ensure the content area has `overflow-y-auto` and the new class.

```tsx
// In components/kanban/CardCoverSelector.tsx

// ...
<PopoverContent className="w-80 p-0 overflow-hidden" align="start">
    {/* Header */}
    <div className="...">...</div>

    {/* Scrollable Content Area */}
    {/* We need to constrain height to force scroll if needed, e.g. max-h-[400px] */}
    <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto glass-scrollbar"> 
       {/* ... content ... */}
    </div>
</PopoverContent>
```

## Verification Plan

### Manual Verification
1.  **Open Kanban Board**: Navigate to a card.
2.  **Open Cover Selector**: Click on the "Capa" button or icon.
3.  **Check Scroll**:
    *   Ensure the content area is scrollable (add many attachments if needed to trigger scroll).
    *   Verify the scrollbar styling:
        *   Is it thin?
        *   Does it look "glassy" (semi-transparent thumb)?
        *   Does it match the Apple aesthetic?
4.  **Dark/Light Mode**: Toggle themes to ensure visibility.

### Automated Tests
*   No specific automated tests for visual scrollbar styling (requires visual regression testing tools which are heavy). Manual verification is standard for CSS scrollbar styling.

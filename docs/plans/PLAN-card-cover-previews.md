# PLAN: Enhanced Card Cover Previews

🤖 **Applying knowledge of @frontend-specialist & @web-design-guidelines...**

## deliverable: docs/PLAN-card-cover-previews.md

## Context
The current cover size buttons in `CardCoverSelector.tsx` are generic gray blocks. We want them to look like Trello's:
- Use the actual selected **color** or **image** as the background for the preview.
- Show realistic "skeleton" lines for card contents (title, metadata).
- Highlight the active selection with a better border/ring.

## Proposed Changes

### [CardCoverSelector.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/CardCoverSelector.tsx)
- Update the `Button` content for both 'small' (Banner) and 'large' (Capa) modes.
- Pass the current `cover_type` and `cover_value` into these "mini-card" previews.
- **Small Mode Preview**:
    - Top part: Background color/image.
    - Bottom part: Darker gray lines representing title and icons.
- **Large Mode Preview**:
    - Entire background: Color/image.
    - Bottom layer: Text skeleton on top of the background (matching `textTheme`).

## Verification Plan
1. **Color Update**: Change color and verify that the preview buttons reflect the new color.
2. **Image Update**: Select an image and verify the tiny previews show the image.
3. **Toggle Logic**: Ensure clicking them still updates the card correctly.

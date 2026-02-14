# Plan: Kanban Image Upload

> **Goal:** Implement drag-and-drop image upload for Kanban card covers using Kibo UI Dropzone components, integrated with Supabase Storage.

## 1. Data Analysis (`types/kanban.ts`)

**Status:** Ready ✅

The `KanbanCard` interface already supports image covers through the following fields:
- `cover_type`: Can be `'image'`.
- `cover_value`: Stores the image URL (perfect for `https://.../storage/v1/object/public/...`).
- `cover_mode`, `cover_size`, `cover_text_theme`: Already present for styling.
- `attachments`: Existing attachments array can also be used as a source, but for direct cover upload we will use `cover_value`.

**Conclusion:** No database schema changes are required for the `kanban_cards` table.

## 2. Infrastructure (Supabase Storage)

**Status:** Needs Setup ⚠️

We need a dedicated storage bucket for card covers.

### Required Actions:
1.  **Create Bucket:** `card-covers`
2.  **Configuration:**
    - Public: `true` (Images must be publicly accessible for rendering on cards).
    - File Size Limit: 5MB (Recommended).
    - Allowed MIME types: `image/*`.
3.  **RLS Policies:**
    - **SELECT (Public):** Enable for all users (`true`).
    - **INSERT (Authenticated):** Enable for authenticated users (`auth.role() = 'authenticated'`).
    - **UPDATE/DELETE (Owner/Auth):** Enable for authenticated users (simplified for MVP) or restrict to card owner/assignees if using strict RLS. For now, `auth.role() = 'authenticated'` is sufficient for the team context.

## 3. Frontend Implementation (`CardCoverSelector.tsx`)

**Current State:**
- The component uses a `Popover`.
- It has sections for Size, Text Theme, Colors, and Attachments.
- "Attachments" section only displays *existing* files, does not support upload.

**Proposed Changes:**
1.  **New "Upload" Tab/Section:**
    - Use a `Tabs` component inside the Popover: "Cores" vs "Upload/Anexos".
    - OR simpler: Add the Dropzone immediately below the "Cores" grid.
    - **Decision:** Add a dedicated **"Upload"** button/area above the Attachments grid.
2.  **Dropzone Component:**
    - Integrate `react-dropzone`.
    - Style it using Kibo UI / Shadcn aesthetics:
        - Dotted border (`border-dashed`).
        - Hover state (`bg-muted/50`).
        - Loading state/spinner during upload.
3.  **Upload Logic:**
    - Client-side upload using `supabase.storage.from('card-covers').upload()`.
    - Generate a unique file path: `${organizationId}/${cardId}/${timestamp}-${filename}`.
    - Get the Public URL.
    - Call `updateCardCover` action immediately with the new URL.

## 4. Dependencies & Kibo UI Integration

### Dependencies to Install:
```bash
npm install react-dropzone
# Verify: lucide-react, clsx, tailwind-merge (already installed)
```

### UI Component Structure:
We will create an inline `Dropzone` sub-component within `CardCoverSelector.tsx` (or a separate file `components/ui/dropzone.tsx` if reusable):

```tsx
// Concept
<div {...getRootProps()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition">
  <input {...getInputProps()} />
  <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
  <p className="mt-2 text-sm text-muted-foreground">Clique ou arraste uma imagem</p>
</div>
```

## 5. Actions & Data Flow

**Strategy:** Client-Side Upload + Server Action Update.

1.  **User drops file.**
2.  **Frontend:**
    - Generates optimistic preview (optional).
    - Signs into Supabase locally (Client) -> Uploads to `card-covers`.
    - Retrieves `publicUrl`.
3.  **Server Action (`actions/kanban.ts`):**
    - `updateCardCover(cardId, 'image', publicUrl)` is called.
    - Revalidates paths.
4.  **UI:**
    - Updates to show the new image cover immediately.

## 6. Implementation Checklist

- [ ] **Step 1:** Install `react-dropzone`.
- [ ] **Step 2:** Create `card-covers` bucket in Supabase Dashboard or via SQL migration.
- [ ] **Step 3:** Implement `Dropzone` UI in `CardCoverSelector.tsx`.
- [ ] **Step 4:** Implement `handleUpload` function with Supabase Client.
- [ ] **Step 5:** Wire up `updateCardCover` with the uploaded URL.
- [ ] **Step 6:** Verify "Uploading..." state and Error handling.

## 7. Verification Plan
- **Manual Test:**
    - Open a card.
    - Click "Capa".
    - Drag an image onto the new Dropzone.
    - Verify: Spinner appears -> Toast success -> Card cover updates.
    - Refresh page to confirm persistence.

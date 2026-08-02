# Multi-File Upload & Image Sources — Frontend Integration

This document explains two changes to source uploads: uploading several files at once, and adding images as a supported source type.

## ⚠️ Breaking change — upload endpoint now takes/returns a list

`POST /api/v1/notebooks/{notebook_id}/sources` used to accept a single `file` and return a single source object. It now accepts **one or more** files under the field name `files`, and always returns an **array**, even for a single file.

If your upload form currently sends one file per request, you don't have to change your UX — just:
- Send it as `files` (plural field name) instead of `file`.
- Read the response as `data[0]` instead of `data` directly.

## What changed

- Upload several files in a single request (e.g. drag-and-drop a folder of PDFs at once).
- **Images** (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`) are now a valid source type — a photo of handwritten notes, a screenshot of a slide, a scanned page, a diagram. Gemini reads the image (transcribes visible text, describes diagrams/tables/charts) and it becomes a searchable/chattable source exactly like a PDF.
- Uploading an unsupported file type (anything not pdf/txt/pptx/ppt/image) now fails clearly with an error status on the processing stream, instead of silently completing with no content.

## Endpoint

`POST /api/v1/notebooks/{notebook_id}/sources` (multipart/form-data)

Field name: `files` — repeat it once per file in the form data.

### Response

```json
{
  "success": true,
  "message": "Sources uploaded successfully",
  "data": [
    {
      "id": "f0a43b83-...",
      "notebook_id": "89325c9b-...",
      "filename": "lecture-notes.jpg",
      "file_type": "jpg",
      "storage_url": "uploads/f0a43b83-....jpg",
      "status": "pending",
      "metadata_json": null,
      "created_at": "2026-07-22T09:00:00Z",
      "updated_at": "2026-07-22T09:00:00Z"
    },
    {
      "id": "dc805d30-...",
      "filename": "chapter3.pdf",
      "file_type": "pdf",
      "status": "pending",
      "...": "..."
    }
  ]
}
```

Every item starts as `status: "pending"`, exactly like before — you still need to open the processing stream for **each one individually**.

## Processing (same stream endpoint, per source)

`GET /api/v1/notebooks/{notebook_id}/sources/{source_id}/stream`

No changes to this endpoint's shape or behavior. For a batch upload, open one `EventSource` per returned source `id` — they run independently and don't need to be sequenced.

For images specifically, the first progress message differs (like the YouTube one):

```json
{"status": "processing", "message": "Reading image with Gemini...", "progress": 20}
```

Otherwise identical: `processing` → `completed` (`progress: 100`) or `error`.

### New error case — unsupported file type

If a file's type isn't recognized (not pdf/txt/pptx/ppt/image), the stream now emits:

```json
{"status": "error", "message": "Unsupported file type: 'mp3'", "progress": 0}
```

Previously this would have silently reached `completed` with zero extracted content — now you'll actually see it fail, so make sure your error-state UI (already built for other processing failures) handles this message too.

## Trigger example

```javascript
async function uploadSources({ notebookId, files }) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file); // same field name, repeated
  }

  const response = await fetch(`/api/v1/notebooks/${notebookId}/sources`, {
    method: "POST",
    credentials: "include",
    body: formData, // don't set Content-Type manually — let the browser set the multipart boundary
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.detail ?? "Unable to upload sources");
  return payload.data; // always an array, even for one file
}
```

```javascript
// Kick off processing for every uploaded source independently
const sources = await uploadSources({ notebookId, files: selectedFiles });
sources.forEach((source) => {
  trackSourceProcessing({
    notebookId,
    sourceId: source.id,
    onProgress: (p) => updateSourceRow(source.id, p),
    onDone: () => markSourceReady(source.id),
    onError: (e) => markSourceFailed(source.id, e.message),
  });
});
// (trackSourceProcessing is the same helper you already built for single uploads —
// see YOUTUBE_SOURCE_FRONTEND.md for a reference implementation of this pattern)
```

## UI suggestion

- Update your file picker/dropzone to accept `multiple` and to include image mime types in its `accept` filter (e.g. `.pdf,.txt,.pptx,.ppt,.jpg,.jpeg,.png,.webp,.gif`).
- Show each uploaded file as its own row/card with its own progress bar — since each source processes independently, one slow file shouldn't block the others from showing "completed" as soon as they're done.
- Add a distinct icon for image sources (vs. the generic file icon for PDFs) — you already have `file_type` on each source to key off of.
- For the new "unsupported file type" error, show a specific message like *"This file type isn't supported — try PDF, TXT, PPTX, or an image."* rather than a generic failure state.

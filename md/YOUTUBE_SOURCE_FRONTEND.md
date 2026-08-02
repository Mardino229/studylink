# YouTube Sources — Frontend Integration

This document explains how to let users add a public YouTube video as a notebook source, alongside PDFs/TXT/PPTX files.

## What it does

- The user pastes a YouTube URL instead of uploading a file.
- Gemini watches the video and produces a detailed transcript.
- That transcript is chunked and embedded **exactly the same way as any other source** — once processed, the video is queryable in chat, and usable for summaries/flashcards/quiz/podcasts like any other source.
- **Public videos only** (not private/unlisted), roughly up to 1 hour long.

This reuses the exact same processing pipeline (and the exact same SSE progress stream) as file uploads — if you've already built the upload-and-track-progress UI, you're mostly reusing it here, just with a different trigger call.

## Step 1 — Register the video

`POST /api/v1/notebooks/{notebook_id}/sources/youtube`

### Request body

```json
{
  "url": "https://www.youtube.com/watch?v=jNQXAC9IVRw"
}
```

Accepts `youtube.com/watch?v=...`, `youtu.be/...`, and `youtube.com/shorts/...` links.

### Response

```json
{
  "success": true,
  "message": "YouTube source added successfully",
  "data": {
    "id": "2474ed21-80ea-4995-9974-c2d69c371b11",
    "notebook_id": "89325c9b-2d55-4431-8b9e-644722385092",
    "filename": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    "file_type": "youtube",
    "storage_url": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    "status": "pending",
    "metadata_json": null,
    "created_at": "2026-07-14T09:36:00Z",
    "updated_at": "2026-07-14T09:36:00Z"
  }
}
```

Same shape as a regular uploaded source — `filename` and `storage_url` both just hold the URL itself for this type. `status` starts at `"pending"`, exactly like a freshly uploaded file: **processing hasn't happened yet**, you still need step 2.

### Error responses

| Status | Situation |
| --- | --- |
| `400` | URL isn't a recognized YouTube link — `"Please provide a valid public YouTube URL (youtube.com or youtu.be)."` |
| `403` | The notebook doesn't belong to the calling user |
| `404` | Notebook not found |

## Step 2 — Track processing (same SSE stream as file uploads)

`GET /api/v1/notebooks/{notebook_id}/sources/{source_id}/stream`

This is the **same endpoint** already used after a regular file upload — no new stream endpoint was added. Connect to it right after step 1's response, using the returned source `id`.

```json
{"status": "processing", "message": "Watching video and transcribing with Gemini (this can take a moment)...", "progress": 20}
{"status": "processing", "message": "Extracted 1 paragraphs. Starting vectorization...", "progress": 40}
{"status": "processing", "message": "Embedded chunk 1/1...", "progress": 90}
{"status": "processing", "message": "Extracting notebook themes...", "progress": 95}
{"status": "completed", "message": "Vectorization and indexing complete! Ready for Chat.", "progress": 100}
```

The only difference from a file upload is the first progress message — video transcription naturally takes longer than reading a local file, so make sure your progress UI doesn't look "stuck" during that step (it's normal for it to sit at `20%` for several seconds on longer videos).

On error:

```json
{"status": "error", "message": "...", "progress": 0}
```

## Trigger example

```javascript
async function addYoutubeSource({ notebookId, url }) {
  const response = await fetch(`/api/v1/notebooks/${notebookId}/sources/youtube`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.detail ?? "Unable to add this YouTube video");
  }

  return payload.data; // the pending Source — use its `id` to open the SSE stream
}
```

```javascript
function trackSourceProcessing({ notebookId, sourceId, onProgress, onDone, onError }) {
  const url = `/api/v1/notebooks/${notebookId}/sources/${sourceId}/stream`;
  const source = new EventSource(url);

  source.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    onProgress?.(payload);

    if (payload.status === "completed") {
      onDone?.();
      source.close();
    }
    if (payload.status === "error") {
      onError?.(new Error(payload.message));
      source.close();
    }
  };

  return () => source.close();
}
```

## UI suggestion

- Add an "Add YouTube video" option next to "Upload file" in the source picker — a simple URL input instead of a file picker.
- Validate the URL format client-side before calling the endpoint (matching pattern: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`) for instant feedback, but still handle the `400` from the backend as the source of truth.
- In the sources list, show a YouTube icon/thumbnail for `file_type === "youtube"` sources instead of a generic file icon — you already have the source's `filename` which is the URL, so you can derive a thumbnail (`https://img.youtube.com/vi/<video_id>/hqdefault.jpg`) or an embedded preview if you want a richer look.
- Mention the "public videos only, ~1 hour max" limitation near the input, so users aren't surprised if a private/very long video fails.

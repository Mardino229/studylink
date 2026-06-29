# Frontend Guide - Folder and Notebook Actions

This guide documents the endpoints to create folders, assign notebooks to folders, move notebooks, remove notebooks from folders, and list notebooks in a folder with pagination.

## Base URL

`/api/v1`

## Auth

All endpoints require authentication.

Use cookie auth (current backend behavior) and ensure requests are sent with credentials.


## 1) Folder endpoints

### Create folder

- Method: `POST`
- URL: `/folders`
- Body:

```json
{
  "name": "My Folder",
  "description": "Optional description"
}
```

### List folders (paginated)

- Method: `GET`
- URL: `/folders?page=1&per_page=20`

### Update folder

- Method: `PUT`
- URL: `/folders/{folder_id}`
- Body:

```json
{
  "name": "New Folder Name",
  "description": "Updated description"
}
```

### Delete folder

- Method: `DELETE`
- URL: `/folders/{folder_id}`

## 2) Notebook endpoints related to folders

### Create notebook directly in a folder

- Method: `POST`
- URL: `/notebooks`
- Body:

```json
{
  "name": "Notebook A",
  "description": "Optional",
  "folder_id": "11111111-2222-3333-4444-555555555555"
}
```

### Move notebook to another folder

- Method: `PATCH`
- URL: `/notebooks/{notebook_id}`
- Body:

```json
{
  "folder_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
}
```

### Remove notebook from folder

- Method: `PATCH`
- URL: `/notebooks/{notebook_id}`
- Body:

```json
{
  "folder_id": null
}
```

### List notebooks filtered by folder (existing endpoint)

- Method: `GET`
- URL: `/notebooks?folder_id={folder_id}&page=1&per_page=20`

### List notebooks without any folder

- Method: `GET`
- URL: `/notebooks/unassigned?page=1&per_page=20`

## 3) Dedicated endpoint: notebooks of one folder (paginated)

This is the new endpoint added for frontend convenience.

### Get notebooks from a folder

- Method: `GET`
- URL: `/folders/{folder_id}/notebooks?page=1&per_page=20`

### Example response

```json
{
  "success": true,
  "message": "Folder notebooks retrieved successfully",
  "data": {
    "items": [
      {
        "id": "5edeb66d-2fd2-4d5f-8b17-a051f9c8d458",
        "name": "Notebook A",
        "description": "Optional",
        "folder_id": "11111111-2222-3333-4444-555555555555",
        "user_id": "f82e2f52-3d66-4f61-99f5-f7c64de8b6c0",
        "created_at": "2026-05-29T09:10:00",
        "updated_at": "2026-05-29T09:10:00"
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "per_page": 20,
      "total_pages": 3
    }
  }
}
```

## 4) Frontend implementation pattern

### Suggested actions

1. Load folders: `GET /folders`
2. User selects folder: call `GET /folders/{folder_id}/notebooks?page=1&per_page=20`
3. User drags notebook to another folder: call `PATCH /notebooks/{notebook_id}` with new `folder_id`
4. User removes notebook from folder: call `PATCH /notebooks/{notebook_id}` with `folder_id: null`
5. Refresh affected folder lists


## 5) Error cases to handle

- `404 Folder not found`
- `403 Not enough permissions`
- Validation errors on UUID/payload

Show user-friendly toasts and keep local UI state consistent.

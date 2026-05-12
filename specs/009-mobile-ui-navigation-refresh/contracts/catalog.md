# Catalog API Contract Update

## Modified Endpoint: `GET /api/Services`

### Query Parameters
- `searchTerm` (optional, string): Search in service title or description.
- `category` (optional, string): Filter by category ID or name.
- `tag` (optional, string): Filter by tag name.

### Success Response (200 OK)
```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "basePrice": 0.0,
    "imageUrl": "url",
    "category": { "id": "uuid", "name": "string" },
    "executor": { "id": "uuid", "fullName": "string" }
  }
]
```

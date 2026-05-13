# API Contract: Catalog and Discovery

## Endpoints

### 1. Get Services
`GET /api/Services`

**Query Parameters**:
- `category` (optional): Category name/ID
- `searchTerm` (optional): Text search
- `sortBy` (optional): Sort criteria

**Response (200 OK)**:
```json
[
  {
    "id": "uuid",
    "title": "Service Title",
    "description": "...",
    "basePrice": 150.00,
    "categoryName": "Programming",
    "imageUrl": "path/to/img",
    "rating": 4.8,
    "executor": {
      "id": "uuid",
      "name": "Executor Name",
      "profilePicture": "path/to/img"
    }
  }
]
```

### 2. Get Executors
`GET /api/Executors`

**Response (200 OK)**:
```json
[
  {
    "id": "uuid",
    "fullName": "Full Name",
    "profilePicture": "path/to/img",
    "rating": 4.9,
    "completedOrders": 25,
    "major": "Computer Science",
    "bio": "Expert in .NET and React Native"
  }
]
```

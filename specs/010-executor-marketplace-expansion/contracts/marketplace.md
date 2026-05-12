# Executor Marketplace API Contracts

## 1. Executor Discovery
`GET /api/Executors`

### Query Parameters
- `searchTerm`: `string?` (Name, Major, Bio)
- `category`: `string?` (Filter by primary skill)
- `sortBy`: `string?` (Rating, Recency, CompletedOrders)

### Response (200 OK)
```json
[
  {
    "id": "uuid",
    "fullName": "string",
    "profilePicture": "url",
    "rating": 4.8,
    "completedOrders": 120,
    "major": "string",
    "isOnline": true
  }
]
```

## 2. Admin Service Approval
`POST /api/Admin/Services/{id}/Approve`
`POST /api/Admin/Services/{id}/Reject`

### Request Body (Reject)
```json
{
  "reason": "string"
}
```

## 3. Work Gallery
`GET /api/Executors/{id}/Gallery`
`POST /api/Executors/Gallery` (Multipart/Form-Data)

### Response (GET)
```json
[
  {
    "id": "uuid",
    "title": "string",
    "mediaUrl": "url",
    "mediaType": "image"
  }
]
```

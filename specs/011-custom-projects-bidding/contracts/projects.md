# Custom Projects API Contracts

## 1. Projects Management
`POST /api/Projects` (Student)
`GET /api/Projects/Open` (Executor)
`GET /api/Projects/Mine` (Student)

### Request Body (POST)
```json
{
  "title": "string",
  "description": "string",
  "budget": 100.0,
  "deadline": "2026-06-01T00:00:00Z",
  "categoryId": "uuid",
  "isPublic": true,
  "invitedExecutors": ["uuid1", "uuid2"] 
}
```

## 2. Bidding
`POST /api/Projects/{id}/Offers` (Executor)
`PUT /api/Projects/Offers/{offerId}` (Executor - Negotiation)

### Request Body (POST / PUT)
```json
{
  "proposedPrice": 120.0,
  "proposedDays": 5,
  "coverLetter": "string"
}
```

## 3. Arbitration
`POST /api/Projects/Offers/{offerId}/Accept` (Student)

### Response (200 OK)
```json
{
  "message": "Offer accepted and Order generated successfully",
  "orderId": "uuid"
}
```

# Advanced Chat System - API Contracts

## Endpoints

### 1. Initialize Private Chat
- **POST** `/api/Chat/Private`
- **Auth**: Required
- **Body**: `Guid` (userId of the target user)
- **Response**: `200 OK`
```json
{
  "id": "guid",
  "messages": [
    {
      "id": "guid",
      "content": "string",
      "sentAt": "datetime",
      "senderId": "guid",
      "senderName": "string",
      "attachmentUrl": "string?",
      "attachmentType": "string?",
      "customOffer": null
    }
  ]
}
```

### 2. Get Private Inbox
- **GET** `/api/Chat/Inbox`
- **Auth**: Required
- **Response**: `200 OK`
```json
[
  {
    "id": "guid",
    "partnerId": "guid",
    "partnerName": "string",
    "partnerImage": "string",
    "lastMessage": "string",
    "lastMessageAt": "datetime",
    "unreadCount": 0
  }
]
```

### 3. Send Message
- **POST** `/api/Chat/{chatId}/Message`
- **Auth**: Required
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `content`: string (optional)
  - `attachment`: file (optional, max 20MB)
  - `attachmentType`: string (optional)
  - `attachmentUrl`: string (optional)
- **Response**: `200 OK`
```json
{
  "id": "guid",
  "chatId": "guid",
  "senderId": "guid",
  "content": "string",
  "attachmentUrl": "string?",
  "attachmentType": "string?",
  "sentAt": "datetime"
}
```

### 4. Upload Attachment
- **POST** `/api/Chat/Attachments`
- **Auth**: Required
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: file (required, max 20MB)
- **Response**: `200 OK`
```json
{
  "url": "string",
  "type": "string"
}
```

### 5. Send Custom Offer
- **POST** `/api/Chat/Offers`
- **Auth**: Required (Executor only)
- **Body**:
```json
{
  "chatId": "guid",
  "title": "string",
  "description": "string",
  "price": 0.0,
  "deliveryDays": 0
}
```
- **Response**: `200 OK`

### 6. Accept Custom Offer
- **POST** `/api/Chat/Offers/{id}/Accept`
- **Auth**: Required (Student only)
- **Response**: `200 OK`
```json
{
  "orderId": "guid"
}
```

## SignalR Hubs

### `/hubs/chat` (Order Chats)
- **ReceiveMessage**: `(payload: object)`

### `/hubs/private-chat` (Private Inbox)
- **ReceiveMessage**: `(payload: object)`
- **ReceiveCustomOffer**: `(payload: object)`
  ```json
  {
    "customOffer": { /* CustomOffer entity */ },
    "chatId": "guid",
    "senderId": "guid"
  }
  ```

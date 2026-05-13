# API Contracts: Rich Chat Media, Admin Service Approval & Advanced Search

**Feature**: 013-rich-chat-media-admin-search
**Date**: 2026-05-13
**Base URL**: `/api`
**Auth**: JWT Bearer (all endpoints require authentication unless noted)

---

## Chat: Rich Media Messages

### POST `/Chat/{chatId}/Message` — Extended

**Description**: Send a message with optional rich media attachments. Existing endpoint extended.

**Request** (multipart/form-data):
```
content:     string?          # Plain text content (optional if attachments present)
audioFile:   File?            # Voice message audio file (≤5min, wav/m4a/mp3)
waveformData: string?         # JSON array of int (0–100), e.g. "[12,45,78,...]"
attachments: File[]?          # Images/videos/documents (each ≤50MB)
```

**Response 200**:
```json
{
  "id": "uuid",
  "chatId": "uuid",
  "senderId": "uuid",
  "type": "Voice | Image | Video | File | Text",
  "content": "",
  "waveformData": [12, 45, 78, 90, 55],
  "voiceDurationSeconds": 14,
  "attachments": [
    {
      "id": "uuid",
      "url": "https://...",
      "thumbnailUrl": "https://...",
      "fileName": "photo.jpg",
      "fileType": "Image",
      "fileSize": 1048576,
      "durationSeconds": null
    }
  ],
  "isDeleted": false,
  "sentAt": "2026-05-13T01:00:00Z"
}
```

**Validation Errors 400**:
```json
{ "error": "FILE_TOO_LARGE", "maxBytes": 52428800 }
{ "error": "VOICE_TOO_LONG", "maxSeconds": 300 }
{ "error": "NO_CONTENT" }
```

---

### GET `/Chat/Inbox` — Extended Response

**Description**: Returns all conversations for the authenticated user. Extended to include `lastMessageType` and `unreadCount`.

**Response 200**:
```json
[
  {
    "chatId": "uuid",
    "contactId": "uuid",
    "contactName": "Ahmed Ali",
    "contactAvatar": "https://...",
    "lastMessagePreview": "شكراً جزيلاً",
    "lastMessageType": "Text | Voice | Image | Video | File",
    "unreadCount": 3,
    "lastMessageAt": "2026-05-13T00:55:00Z"
  }
]
```

---

### POST `/Chat/Inbox/{chatId}/Read` — NEW

**Description**: Mark a conversation as read; updates `ChatReadReceipt.LastReadAt`.

**Response 204**: No content.

---

## Admin: Chat Moderation

### POST `/api/Admin/Messages/{messageId}/Delete` — NEW

**Auth**: Admin role required.

**Request Body**:
```json
{ "notes": "Spam/inappropriate content (optional)" }
```

**Response 200**:
```json
{
  "moderationActionId": "uuid",
  "messageId": "uuid",
  "deletedAt": "2026-05-13T01:10:00Z"
}
```

**Side effect**: Broadcasts `MessageDeleted(chatId, messageId)` SignalR event to the chat group. Clients replace message content with `"[تم حذف الرسالة]"`.

---

### POST `/api/Admin/Messages/{messageId}/Flag` — NEW

**Auth**: Admin role required.

**Request Body**:
```json
{ "notes": "Reason for flagging (optional)" }
```

**Response 200**:
```json
{ "moderationActionId": "uuid", "flaggedAt": "2026-05-13T01:12:00Z" }
```

---

### POST `/api/Admin/Users/{userId}/Mute` — NEW

**Auth**: Admin role required.

**Request Body**:
```json
{ "durationMinutes": 1440, "notes": "Repeated violations" }
```

**Response 200**:
```json
{
  "moderationActionId": "uuid",
  "userId": "uuid",
  "muteExpiresAt": "2026-05-14T01:12:00Z"
}
```

**Enforcement**: `ChatHub.SendMessage` checks for active mute before processing — returns `HubException("USER_MUTED")` with expiry if muted.

---

### GET `/api/Admin/Conversations` — NEW

**Auth**: Admin role required.

**Query Params**: `?page=1&pageSize=20&type=Direct|Ticket&search=`

**Response 200**:
```json
{
  "totalCount": 142,
  "page": 1,
  "items": [
    {
      "chatId": "uuid",
      "type": "Direct | Ticket",
      "participants": [
        { "userId": "uuid", "name": "Ahmed", "role": "Student" },
        { "userId": "uuid", "name": "Sara", "role": "Executor" }
      ],
      "lastMessage": { "preview": "...", "type": "Text", "sentAt": "..." },
      "flaggedCount": 0,
      "unreadCount": 0
    }
  ]
}
```

---

## Admin: Service Approval

### GET `/api/Admin/Services/Pending` — NEW

**Auth**: Admin role required.

**Query Params**: `?page=1&pageSize=20&sortBy=SubmittedAt`

**Response 200**:
```json
{
  "totalCount": 8,
  "page": 1,
  "items": [
    {
      "id": "uuid",
      "title": "تصميم شعار احترافي",
      "description": "...",
      "category": { "id": "uuid", "name": "Design" },
      "subCategory": { "id": "uuid", "name": "Logo" },
      "basePrice": 150.00,
      "estimatedDeliveryDays": 3,
      "executor": { "id": "uuid", "name": "Sara Ahmed", "rating": 4.8 },
      "imageUrl": "https://...",
      "submittedAt": "2026-05-12T18:00:00Z",
      "status": "PendingApproval"
    }
  ]
}
```

---

### PUT `/api/Admin/Services/{id}/Approve` — NEW

**Auth**: Admin role required.

**Request Body**:
```json
{ "notes": "Quality service, approved." }
```

**Response 200**:
```json
{
  "serviceId": "uuid",
  "status": "Active",
  "approvedAt": "2026-05-13T01:15:00Z",
  "approvedBy": "uuid"
}
```

**Side effect**: Sends in-app notification to executor: `"تمت الموافقة على خدمتك: {title}"`.

---

### PUT `/api/Admin/Services/{id}/Reject` — NEW

**Auth**: Admin role required.

**Request Body**:
```json
{
  "reason": "الوصف غير كافٍ، يرجى إضافة تفاصيل أكثر.",
  "notes": "Admin internal notes (optional)"
}
```

**Response 200**:
```json
{
  "serviceId": "uuid",
  "status": "Rejected",
  "rejectedAt": "2026-05-13T01:16:00Z",
  "rejectedBy": "uuid"
}
```

**Side effect**: Sends in-app notification to executor with rejection reason. Existing active orders on this service continue unaffected.

---

## Advanced Search: Services & Executors

### GET `/api/ExecutorServices/Search` — NEW (replaces/extends current list endpoint)

**Auth**: Public (students) or authenticated.

**Query Params**:
```
keyword:        string?     # Full-text search on title + description
categoryId:     uuid?
subCategoryId:  uuid?
minPrice:       decimal?
maxPrice:       decimal?
minRating:      decimal?    # 1.0–5.0
availability:   string?     # "available_now" | "scheduled"
deliveryDays:   int?        # Max delivery days
sortBy:         string?     # "relevance" | "rating" | "price_asc" | "price_desc" | "newest"
page:           int = 1
pageSize:       int = 20
```

**Response 200**:
```json
{
  "totalCount": 347,
  "page": 1,
  "pageSize": 20,
  "items": [
    {
      "id": "uuid",
      "title": "...",
      "description": "...",
      "basePrice": 100.00,
      "rating": 4.7,
      "reviewsCount": 23,
      "estimatedDeliveryDays": 2,
      "category": { "id": "uuid", "name": "..." },
      "subCategory": { "id": "uuid", "name": "..." },
      "executor": {
        "id": "uuid",
        "name": "...",
        "avatar": "https://...",
        "rating": 4.8,
        "isAvailableNow": true
      },
      "imageUrl": "https://...",
      "status": "Active"
    }
  ]
}
```

**Note**: Only `status = "Active"` services are ever returned from this endpoint.

---

### GET `/api/Admin/Executors` — NEW (Admin Executor Management with filters)

**Auth**: Admin role required.

**Query Params**: `?name=&specialty=&status=Active|Inactive&joinedAfter=&joinedBefore=&page=1&pageSize=20`

**Response 200**:
```json
{
  "totalCount": 58,
  "page": 1,
  "items": [
    {
      "id": "uuid",
      "name": "Sara Ahmed",
      "avatar": "https://...",
      "email": "sara@example.com",
      "specialty": "Design",
      "rating": 4.8,
      "completedOrdersCount": 42,
      "isActive": true,
      "joinedAt": "2025-11-01T00:00:00Z",
      "pendingServicesCount": 1,
      "activeServicesCount": 5
    }
  ]
}
```

---

## SignalR Hub Events (Extended)

### Hub: `/hubs/chat`

| Event (Client → Server) | Description |
|---|---|
| `SendMessage(chatId, payload)` | Existing. Checks mute status before processing. |
| `JoinChat(chatId)` | Existing. |
| `LeaveChat(chatId)` | Existing. |
| `MarkRead(chatId)` | NEW. Updates `ChatReadReceipt`; broadcasts `ReadReceipt(chatId, userId, timestamp)`. |

| Event (Server → Client) | Description |
|---|---|
| `ReceiveMessage(message)` | Existing. Payload extended with `type`, `voiceDurationSeconds`, `waveformData`. |
| `MessageDeleted(chatId, messageId)` | NEW. Admin moderation soft-delete broadcast. |
| `ReadReceipt(chatId, userId, timestamp)` | NEW. Unread count sync. |

---

## Subcategory Endpoints

### GET `/api/Categories/{categoryId}/SubCategories` — NEW

**Response 200**:
```json
[
  { "id": "uuid", "name": "Logo Design", "categoryId": "uuid" },
  { "id": "uuid", "name": "Brand Identity", "categoryId": "uuid" }
]
```

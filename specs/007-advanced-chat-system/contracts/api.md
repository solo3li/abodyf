# API Contract: Advanced Chat System

## 1. REST Endpoints

### POST /api/Chat/Attachments
- **Description**: Uploads a file (image, document, or audio) for a chat message. Enforces 20MB limit.
- **Request**: `multipart/form-data`
  - `file`: File
  - `type`: String (`Image`, `Document`, `Audio`)
- **Response (200)**: `{ "url": "/uploads/chat/xyz.ext", "type": "Audio" }`

### POST /api/Chat/Private
- **Description**: Initializes or retrieves an existing private chat with a specific user.
- **Request Body**: `{ "targetUserId": "GUID" }`
- **Response (200)**: `ChatDto`

## 2. SignalR Hubs

### `PrivateChatHub` (New)
**Route**: `/hubs/private-chat`
- **Methods to Invoke (Client -> Server)**:
  - `JoinChat(string chatId)`
  - `LeaveChat(string chatId)`
  - `SendMessage(string chatId, MessagePayload payload)`
  - `SendCustomOffer(string chatId, CustomOfferPayload payload)`
- **Events to Listen (Server -> Client)**:
  - `ReceiveMessage(MessageDto message)`
  - `ReceiveCustomOffer(CustomOfferDto offer)`
  - `UserTyping(string userId)`
  - `UserRecording(string userId)`

### `ChatHub` (Existing - Order Chats)
**Route**: `/hubs/chat`
- **Updates**:
  - Add support for `MessagePayload` with attachments and audio.

### `MessagePayload`
```json
{
  "content": "Text message (optional)",
  "attachmentUrl": "/uploads/chat/...",
  "attachmentType": "Audio" // Image, Document, Audio
}
```

### `CustomOfferPayload`
```json
{
  "title": "Custom Logo Design",
  "description": "3 concepts, unlimited revisions",
  "price": 150.00,
  "deliveryDays": 5
}
```

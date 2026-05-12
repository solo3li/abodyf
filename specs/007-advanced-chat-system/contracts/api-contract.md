# API Contract: Advanced Chat System

## Chat Management

### POST /api/Chat/Private/Initiate
Initiates a private chat between a student and an executor.
- **Request**:
  ```json
  {
    "executorId": "guid"
  }
  ```
- **Response**: `200 OK` with `ChatDto`.

### GET /api/Chat/Inbox
Retrieves the list of private chats for the current user.
- **Query Parameters**:
  - `filter`: `All`, `Unread`, `Starred` (Default: `All`)
- **Response**: `200 OK` with `List<ChatSummaryDto>`.

## Custom Offers

### POST /api/Offer
Sends a custom offer in a private chat.
- **Request**:
  ```json
  {
    "chatId": "guid",
    "title": "string",
    "description": "string",
    "price": 150.00,
    "deliveryDays": 3
  }
  ```
- **Response**: `201 Created` with `MessageDto`.

### POST /api/Offer/{id}/Withdraw
Withdraws a pending offer.
- **Response**: `204 No Content`.

### POST /api/Offer/{id}/Accept
Accepts an offer and initiates order creation.
- **Response**: `200 OK` with `OrderId`.

## Message Handling

### POST /api/Chat/{chatId}/Message (Multipart)
Sends a message with text, audio, and/or multiple files.
- **Form Data**:
  - `Content`: string
  - `AudioFile`: File (optional)
  - `Attachments`: File[] (optional)
- **Response**: `200 OK` with `MessageDto` (includes `WaveformData` if audio was processed).

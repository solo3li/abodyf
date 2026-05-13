# Quickstart: Feature 013 — Rich Chat Media, Admin Service Approval & Advanced Search

**Branch**: `013-rich-chat-media-admin-search`
**Last updated**: 2026-05-13

---

## Prerequisites

- Node.js ≥ 20, .NET 10 SDK, PostgreSQL running locally
- Expo CLI (`npm install -g expo-cli`)
- Existing project dependencies installed

---

## 1. Apply Database Migrations

```bash
cd msa3ed/server
dotnet ef migrations add AddMessageTypeAndSoftDelete
dotnet ef migrations add AddAttachmentThumbnailAndDuration
dotnet ef migrations add AddSubCategory
dotnet ef migrations add AddModerationAction
dotnet ef migrations add AddChatReadReceipt
dotnet ef migrations add AddServiceLastEditedAt
dotnet ef migrations add AddTicketMessageRichMedia
dotnet ef database update
```

## 2. Run Backend

```bash
cd msa3ed/server
dotnet run
# API available at https://localhost:5001
```

## 3. Run Frontend

```bash
cd msa3ed/UIS
npx expo start
# Press 'i' for iOS, 'a' for Android, 'w' for Web
```

## 4. Run Tests

```bash
# Backend tests
cd msa3ed/Uis.Tests
dotnet test

# Frontend tests
cd msa3ed/UIS
npx jest
```

## 5. Validate End-to-End (Manual Smoke Test)

1. **Voice Message**: Open a chat as student → hold mic button → record 5s → release → preview waveform → tap Play → tap Send → confirm bubble appears with waveform in conversation.
2. **Image Attachment**: In same chat → tap attachment → pick image → confirm thumbnail renders inline.
3. **Service Approval**: Log in as executor → create new service → confirm status = "Pending Approval" → log in as admin → navigate Service Approval → approve → log in as student → search → confirm service appears.
4. **Advanced Search**: Open search screen → enter keyword → open filter panel → set category + price range + min rating → confirm chip bar shows 3 active filters → tap × on rating chip → confirm results update.
5. **Admin Moderation**: As admin → open any chat → flag a message → delete a message → confirm deleted message shows "[تم حذف الرسالة]" placeholder in the thread.
6. **RTL**: Switch device/browser to Arabic locale → re-open chat → confirm waveform, bubbles, and filter panel mirror correctly.

## Key API Endpoints to Test

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/Chat/{chatId}/Message` | POST (multipart) | Send voice/image/video/file |
| `/api/Chat/Inbox` | GET | Inbox with unread counts + media type labels |
| `/api/Chat/Inbox/{chatId}/Read` | POST | Mark conversation as read |
| `/api/Admin/Services/Pending` | GET | Service approval queue |
| `/api/Admin/Services/{id}/Approve` | PUT | Approve a service |
| `/api/Admin/Services/{id}/Reject` | PUT | Reject a service |
| `/api/Admin/Messages/{messageId}/Delete` | POST | Soft-delete + SignalR broadcast |
| `/api/Admin/Users/{userId}/Mute` | POST | Mute a participant |
| `/api/ExecutorServices/Search` | GET | Advanced filtered search |
| `/api/Admin/Executors` | GET | Admin executor management with filters |

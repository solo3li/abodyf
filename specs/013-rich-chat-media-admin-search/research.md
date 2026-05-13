# Research: Rich Chat Media, Admin Service Approval & Advanced Search

**Feature**: 013-rich-chat-media-admin-search
**Date**: 2026-05-13
**Branch**: 013-rich-chat-media-admin-search

---

## 1. Voice Recording & Waveform Visualizer

### Decision
Use the **existing `Waveform` component** (`msa3ed/UIS/components/Waveform.tsx`) as the base; extend it with a live recording mode that streams amplitude peaks in real time. Pair with `expo-av` (already in project) for audio capture and playback.

### Rationale
- `Waveform.tsx` already accepts `peaks: number[]` and `progress: number` — the data shape is already correct.
- `expo-av` is the cross-platform standard for Expo projects and provides `Audio.Recording` with metering API (`getStatusAsync().metering`), which yields dB values that can be normalized to 0–100 for waveform peaks.
- No third-party native module is required, keeping the build reproducible.

### Recording Pause/Resume
`expo-av` `Audio.Recording` supports `.pauseAsync()` and `.resumeAsync()` natively — maps directly to the clarified auto-pause-on-interruption requirement (FR-028). iOS interruption callbacks (`InterruptionModeIOS`) and Android audio focus handling are already managed by `expo-av`.

### Pre-Send Preview
Store sampled amplitude array + recorded URI in a `VoicePreview` local state slice. Preview panel renders existing `Waveform` with `progress=0` and drives `Audio.Sound` for playback.

### Alternatives Considered
- **react-native-audio-recorder-player**: More features but adds a native module that complicates Expo managed workflow.
- **Custom Web Audio API** for web: Unnecessary; `expo-av` covers Web via `HTMLMediaElement` shim.

---

## 2. Media Message Types (Image, Video, File)

### Decision
Use **`expo-image-picker`** and **`expo-document-picker`** for selection; `FormData` multipart POST to the existing `/Chat/{chatId}/Message` endpoint (already implemented in `sendMessage` thunk). For inline display: `expo-image` for images, `expo-video` (or `expo-av` `Video` component) for video, custom `FileAttachment` bubble for documents.

### File Size Enforcement
Client-side: check `asset.fileSize` from picker result before constructing `FormData`. Server-side: add `[RequestSizeLimit]` attribute and file-size validation in the message controller.

### Upload Retry (FR-030)
Implement exponential back-off retry inside the `sendMessage` thunk using a helper that wraps `apiFetch` with max 3 retries (delays: 1s, 2s, 4s). Store `uploadStatus: 'pending' | 'uploading' | 'failed' | 'delivered'` in Redux message state to drive the Retry button UI.

### Alternatives Considered
- **Chunked upload (tus protocol)**: Overkill for ≤50 MB files; adds server complexity.
- **Presigned S3 URLs**: Valid for scale, but current architecture uses server-side storage; refactor deferred.

---

## 3. Backend: Message & Attachment Schema Extensions

### Decision
The existing `Message` and `MessageAttachment` models in `AppModels.cs` already support attachments and `WaveformData int[]`. Required additions:

| Field | Location | Purpose |
|---|---|---|
| `MessageType` (enum: Text/Voice/Image/Video/File) | `Message` | Drive FE rendering |
| `VoiceDurationSeconds` | `Message` | Display duration on bubble |
| `UploadStatus` string | (FE-only Redux state, not persisted) | Drive retry UI |
| `IsDeleted` bool | `Message` | Soft-delete for admin moderation |
| `DeletedByAdminId` Guid? | `Message` | Moderation audit |

### Existing Infrastructure
- `ChatHub.cs` + `PrivateChatHub.cs` already use SignalR groups — extend with `SendMessageDeleted(chatId, messageId)` event.
- `MessageAttachment.FileType` already stores `"Image" | "Document" | "Audio"` — add `"Video"` value.

---

## 4. Admin Moderation (FR-032)

### Decision
Add a new `ModerationAction` table (maps to spec entity). Add three admin-only API endpoints:
- `POST /api/Admin/Messages/{messageId}/Delete` — soft-delete + broadcast via SignalR
- `POST /api/Admin/Messages/{messageId}/Flag` — create `ModerationAction` record
- `POST /api/Admin/Users/{userId}/Mute` — create `ModerationAction` with `DurationMinutes`

Admin panel checks `User.IsAdmin` via JWT claim. Mute enforcement: middleware checks `ModerationAction` for active mutes before processing `SendMessage` hub calls.

### Alternatives Considered
- Hard-delete messages: Rejected — audit trail lost, irreversible without backups.
- Separate admin SignalR hub: Unnecessary; admin panel uses same REST endpoints.

---

## 5. Service Approval Workflow

### Decision
The `Service.Status` field already contains `"Draft" | "PendingApproval" | "Active" | "Paused" | "Rejected"` — the state machine is already modelled. The `ServiceApprovalLog` table also exists. Required additions:

- Add `PUT /api/Admin/Services/{id}/Approve` and `PUT /api/Admin/Services/{id}/Reject` endpoints (admin-only).
- Add a migration to set `Status = "PendingApproval"` as the default for new executor-submitted services (currently `"Draft"`).
- Add `Service.LastEditedAt` and trigger re-approval on any executor PUT/PATCH that updates core listing fields (title, description, price, category, tags).
- Rejected-with-active-orders: query `Order` table for `ServiceId` + active statuses before hiding; orders continue, service `IsActive` set to `false` for discovery.

### Existing Gap
`ExecutorServicesController.cs` currently allows services to go `Active` without admin review. The fix: change the controller's create/update handler to set `Status = "PendingApproval"` and remove any auto-activation logic.

---

## 6. Advanced Search & Filters (FR-022–FR-026)

### Decision
Extend the existing `GET /api/ExecutorServices` endpoint with query parameters. Use **EF Core dynamic `Where` chaining** (no raw SQL) for filter composition. Return paginated results (default 20).

### Filter Parameters
`?keyword=&categoryId=&subcategoryId=&minPrice=&maxPrice=&minRating=&availability=&deliveryDays=&sortBy=&page=&pageSize=`

### Subcategory
`Category` model currently has no subcategory. Add `SubCategory` entity with `CategoryId` FK. One migration required.

### Frontend Filter State
`AdvancedFilterSheet.tsx` already exists as a component shell. Extend it with the full filter UI and wire to Redux `searchSlice` (new slice). Add `dismissible chip` bar above results in `search.tsx`.

### Alternatives Considered
- **Elasticsearch**: Appropriate at scale, but catalog is ≤10,000 services; EF Core with indexed columns is sufficient and avoids operational overhead.
- **GraphQL**: Not in project's current API style (REST throughout).

---

## 7. RTL / Arabic Support (FR-031)

### Decision
The project already uses Arabic text throughout (confirmed by `DeliveryTime: "يومان"` default in `Service` model and `Colors.ts` palette). All new components must:
1. Use `I18nManager.isRTL` check (React Native) or CSS `direction: rtl` (Web) for layout mirroring.
2. Pass `textAlign: 'right'` / `writingDirection: 'rtl'` on all text inputs/labels in new screens.
3. Waveform progress bar: animate `from right` in RTL mode.
4. Admin panel (web): apply `dir="rtl"` to new section containers.

### Automated RTL Snapshot Tests
Use Jest + `react-test-renderer` with `I18nManager.isRTL = true` mock before snapshots. Cover: `ChatBubble`, `VoiceMessageBubble`, `WaveformRecorder`, `AdvancedFilterSheet`, `InboxRow`, `ServiceApprovalCard`.

---

## 8. Home Screen Data Accuracy (FR-008–FR-010)

### Decision
The Home screen currently uses `catalogSlice` which was fixed in feature 012. For this feature, extend with:
- **Offers section**: wire to `OfferController.cs` existing endpoint.
- **Projects section**: wire to `ProjectsController.cs`.
- Add skeleton animation using `react-native-reanimated` `withRepeat + withTiming` (already in project).

---

## 9. Inbox Improvements (FR-011–FR-014)

### Decision
`chatSlice.fetchInbox` already exists and returns chat list. Extend the inbox response DTO to include:
- `lastMessageType`: `"text" | "voice" | "image" | "video" | "file"` (derived server-side)
- `unreadCount`: count of messages after user's last read timestamp
- `lastReadAt`: stored per `Chat`+`User` pair in new `ChatReadReceipt` table

Frontend search: filter `inbox[]` array in Redux selector by `contact.name` + `lastMessage.content` (client-side, <500ms for typical inbox sizes).

Real-time unread badge: SignalR `ReceiveMessage` event handler increments `unreadCount` in Redux state for non-active chats.

---

## Resolved NEEDS CLARIFICATION

All items were resolved during clarification session (2026-05-13). No remaining unknowns.

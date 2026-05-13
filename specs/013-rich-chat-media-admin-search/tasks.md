# Tasks: Rich Chat Media, Admin Service Approval & Advanced Search

**Input**: Design documents from `/specs/013-rich-chat-media-admin-search/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Per Constitution Principle III (v1.2.0), test tasks are included for both frontend (Jest) and backend (xUnit). Tests MUST be written FIRST and confirmed FAILING before implementation begins. Features MUST be implemented **completely** — no stubs. A final auto-commit task MUST appear after both test suites pass.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Add `MessageType` enum, `VoiceDurationSeconds`, `IsDeleted`, `DeletedByAdminId`, `DeletedAt` to `Message` in `msa3ed/server/Models/AppModels.cs`
- [ ] T002 [P] Add `ThumbnailUrl`, `DurationSeconds` to `MessageAttachment`; add `"Video"` to allowed `FileType` values in `msa3ed/server/Models/AppModels.cs`
- [ ] T003 [P] Add `SubCategory` model and `SubCategoryId` FK on `Service` in `msa3ed/server/Models/AppModels.cs`
- [ ] T004 [P] Add `ModerationAction` model and `ModerationActionType` enum in `msa3ed/server/Models/AppModels.cs`
- [ ] T005 [P] Add `ChatReadReceipt` model with unique constraint `(ChatId, UserId)` in `msa3ed/server/Models/AppModels.cs`
- [ ] T006 [P] Add `LastEditedAt`, `LastEditedByExecutorId` to `Service`; add `Type`, `WaveformData`, `VoiceDurationSeconds` to `TicketMessage` in `msa3ed/server/Models/AppModels.cs`
- [ ] T007 Run EF Core migrations M-001 through M-007 in `msa3ed/server/` (depends on T001–T006)
- [ ] T008 [P] Create `searchSlice.ts` with `SearchFilter` state shape in `msa3ed/UIS/store/slices/searchSlice.ts`
- [ ] T009 [P] Extend `chatSlice.ts` with `VoiceRecordingState`, `uploadStatus`, `InboxItemState`, `unreadCount` in `msa3ed/UIS/store/slices/chatSlice.ts`

**Checkpoint**: All models and migrations applied — user story work can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T010 Create `VoiceRecordingService.ts` wrapping `expo-av` `Audio.Recording` with start/pause/resume/stop/getMetering methods in `msa3ed/UIS/services/VoiceRecordingService.ts`
- [ ] T011 [P] Create `ServiceApprovalService.cs` with `ApprovePendingService` and `RejectPendingService` methods (sets status, creates `ServiceApprovalLog`, sends `Notification`) in `msa3ed/server/Services/ServiceApprovalService.cs`
- [ ] T012 [P] Create `SearchService.cs` with EF Core dynamic `Where` chaining for all 7 filter params in `msa3ed/server/Services/SearchService.cs`
- [ ] T013 [P] Change default `Service.Status` from `"Draft"` to `"PendingApproval"` in `ExecutorServicesController.cs` create/update handlers in `msa3ed/server/Controllers/Api/ExecutorServicesController.cs`
- [ ] T014 [P] Extend `ChatHub.cs` with mute enforcement on `SendMessage`, `MarkRead` handler, and `MessageDeleted` broadcast in `msa3ed/server/Hubs/ChatHub.cs`
- [ ] T015 [P] Extend `signalr.ts` with `MarkRead` send helper and `MessageDeleted` / `ReadReceipt` event listeners in `msa3ed/UIS/services/signalr.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: US1 & US2 — Voice Messages & Pre-Send Preview (Priority: P1) 🎯 MVP

**Goal**: Users can record, preview (play/discard/send), and receive voice messages with live waveform.

**Independent Test**: Record → preview waveform → play back → send → see bubble with waveform in thread (both parties).

### Tests for US1 & US2 ⚠️ Write FIRST — ensure FAIL before implementing

- [ ] T016 [P] [US1] BE contract test: `POST /Chat/{chatId}/Message` with `audioFile` returns `type="Voice"`, `waveformData`, `voiceDurationSeconds` in `msa3ed/Uis.Tests/Chat/SendVoiceMessageTests.cs`
- [ ] T017 [P] [US1] BE unit test: `VoiceMessageService` rejects files >300s and >50MB in `msa3ed/Uis.Tests/Services/VoiceMessageServiceTests.cs`
- [ ] T018 [P] [US2] FE unit test: `VoiceRecordingService` state transitions `idle→recording→paused→preview→sending` in `msa3ed/UIS/components/__tests__/VoiceRecordingService.test.ts`
- [ ] T019 [P] [US2] FE snapshot test: `VoiceRecorder.tsx` renders correctly in RTL mode in `msa3ed/UIS/components/__tests__/VoiceRecorder.test.tsx`
- [ ] T020 [P] [US1] FE snapshot test: `VoiceMessageBubble.tsx` renders waveform + duration in RTL mode in `msa3ed/UIS/components/__tests__/VoiceMessageBubble.test.tsx`

### Implementation for US1 & US2

- [ ] T021 [P] [US1] Create `VoiceMessageService.cs` (file validation, storage, waveform extraction) in `msa3ed/server/Services/VoiceMessageService.cs`
- [ ] T022 [US1] Extend `ChatController.cs` to handle `audioFile` + `waveformData` multipart upload; set `Message.Type = Voice` in `msa3ed/server/Controllers/Api/ChatController.cs`
- [ ] T023 [P] [US2] Create `VoiceRecorder.tsx` with live waveform bars (sampling from `VoiceRecordingService`), pause-on-interrupt, preview panel (Play/Discard/Send) — RTL-aware in `msa3ed/UIS/components/chat/VoiceRecorder.tsx`
- [ ] T024 [P] [US1] Create `VoiceMessageBubble.tsx` with static `Waveform` + animated playback progress + duration label — RTL-aware in `msa3ed/UIS/components/chat/VoiceMessageBubble.tsx`
- [ ] T025 [US1] Extend `MessageBubble.tsx` to route to `VoiceMessageBubble`, `MediaMessageBubble`, or text bubble based on `message.type` in `msa3ed/UIS/components/chat/MessageBubble.tsx`
- [ ] T026 [US1] Wire `VoiceRecorder` and `MessageBubble` into `chat.tsx` student screen in `msa3ed/UIS/app/student/(tabs)/chat.tsx`

**Checkpoint**: US1 & US2 independently functional and tested.

---

## Phase 4: US3 — Rich Media for Image/Video/File + Upload Retry (Priority: P1) 🎯

**Goal**: Users can send/receive images, videos, and file attachments inline; failed uploads show Retry button.

**Independent Test**: Pick image → see thumbnail in thread; drop network → see Retry button; re-tap → message delivers.

### Tests for US3 ⚠️ Write FIRST

- [ ] T027 [P] [US3] BE contract test: `POST /Chat/{chatId}/Message` with image attachment returns `type="Image"`, `thumbnailUrl` in `msa3ed/Uis.Tests/Chat/SendMediaMessageTests.cs`
- [ ] T028 [P] [US3] BE unit test: file >50MB rejected with `FILE_TOO_LARGE` error in `msa3ed/Uis.Tests/Chat/FileSizeValidationTests.cs`
- [ ] T029 [P] [US3] FE unit test: `sendMessage` thunk retries 3× on network failure then sets `uploadStatus="failed"` in `msa3ed/UIS/store/slices/__tests__/chatSlice.test.ts`
- [ ] T030 [P] [US3] FE snapshot test: `MediaMessageBubble.tsx` RTL layout for image/video/file types in `msa3ed/UIS/components/__tests__/MediaMessageBubble.test.tsx`

### Implementation for US3

- [ ] T031 [P] [US3] Extend `ChatController.cs` for image/video/file uploads: generate `ThumbnailUrl` for images/videos, set `Message.Type` correctly in `msa3ed/server/Controllers/Api/ChatController.cs`
- [ ] T032 [P] [US3] Create `MediaMessageBubble.tsx` (image thumbnail+expand, video thumbnail+play, file icon+download, `RetryUploadButton`) — RTL-aware in `msa3ed/UIS/components/chat/MediaMessageBubble.tsx`
- [ ] T033 [US3] Add exponential back-off retry (3×: 1s/2s/4s) and `uploadStatus` tracking to `sendMessage` thunk in `msa3ed/UIS/store/slices/chatSlice.ts`
- [ ] T034 [US3] Add image/video/file picker buttons and `RetryUploadButton` to `chat.tsx` in `msa3ed/UIS/app/student/(tabs)/chat.tsx`

**Checkpoint**: US3 independently functional — all media types send and retry correctly.

---

## Phase 5: US4 — Admin Chat & Ticket Moderation (Priority: P2)

**Goal**: Admins can view all conversations with rich media, reply to tickets, flag/delete messages, mute users.

**Independent Test**: Admin opens conversation → views voice/image bubble → deletes a message → sees `[تم حذف الرسالة]` placeholder.

### Tests for US4 ⚠️ Write FIRST

- [ ] T035 [P] [US4] BE contract test: `POST /Admin/Messages/{id}/Delete` soft-deletes and broadcasts `MessageDeleted` SignalR event in `msa3ed/Uis.Tests/Admin/ModerationTests.cs`
- [ ] T036 [P] [US4] BE contract test: `POST /Admin/Users/{id}/Mute` creates `ModerationAction`; muted user's `SendMessage` is rejected with `USER_MUTED` in `msa3ed/Uis.Tests/Admin/MuteUserTests.cs`
- [ ] T037 [P] [US4] FE snapshot test: `ModerationToolbar.tsx` renders flag/delete/mute in RTL mode in `msa3ed/UIS/components/__tests__/ModerationToolbar.test.tsx`

### Implementation for US4

- [ ] T038 [P] [US4] Create `AdminChatController.cs` with `GET /Admin/Conversations`, `POST /Admin/Messages/{id}/Delete`, `POST /Admin/Messages/{id}/Flag`, `POST /Admin/Users/{id}/Mute` in `msa3ed/server/Controllers/Api/Admin/AdminChatController.cs`
- [ ] T039 [US4] Add mute check in `ChatHub.SendMessage`; add `MessageDeleted` broadcast on soft-delete in `msa3ed/server/Hubs/ChatHub.cs`
- [ ] T040 [P] [US4] Create `ModerationToolbar.tsx` (flag/delete/mute actions with confirmation dialogs) — RTL-aware in `msa3ed/UIS/components/admin/ModerationToolbar.tsx`
- [ ] T041 [P] [US4] Add rich media rendering support (reuse `MessageBubble`) to `TicketMessage` in admin panel; extend `TicketMessage` to support `Type`, `WaveformData` in `msa3ed/UIS/app/Admin/index.tsx`
- [ ] T042 [US4] Wire admin conversation list and moderation actions into `Admin/index.tsx` using `AdminChatController` endpoints in `msa3ed/UIS/app/Admin/index.tsx`

**Checkpoint**: US4 independently functional — admin can moderate with full audit trail.

---

## Phase 6: US6 — Admin Service Approval Workflow (Priority: P1) 🎯

**Goal**: Executor services require admin approval before student visibility; full audit log.

**Independent Test**: Create service as executor → status = PendingApproval, hidden from students → admin approves → service visible in search.

### Tests for US6 ⚠️ Write FIRST

- [ ] T043 [P] [US6] BE contract test: new executor service defaults to `PendingApproval`; not returned by student search in `msa3ed/Uis.Tests/Services/ServiceApprovalTests.cs`
- [ ] T044 [P] [US6] BE contract test: `PUT /Admin/Services/{id}/Approve` sets `Active`, creates `ServiceApprovalLog`, sends `Notification` in `msa3ed/Uis.Tests/Admin/ApproveServiceTests.cs`
- [ ] T045 [P] [US6] BE contract test: `PUT /Admin/Services/{id}/Reject` sets `Rejected`; active orders unaffected in `msa3ed/Uis.Tests/Admin/RejectServiceTests.cs`
- [ ] T046 [P] [US6] FE snapshot test: `ServiceApprovalCard.tsx` renders pending service details in RTL in `msa3ed/UIS/components/__tests__/ServiceApprovalCard.test.tsx`

### Implementation for US6

- [ ] T047 [P] [US6] Create `AdminServicesController.cs` with `GET /Admin/Services/Pending`, `PUT /Admin/Services/{id}/Approve`, `PUT /Admin/Services/{id}/Reject` — delegates to `ServiceApprovalService` in `msa3ed/server/Controllers/Api/Admin/AdminServicesController.cs`
- [ ] T048 [US6] Add editor re-approval trigger in `ExecutorServicesController.cs`: on PUT/PATCH that changes core fields, set `Status = PendingApproval` and record `LastEditedAt` in `msa3ed/server/Controllers/Api/ExecutorServicesController.cs`
- [ ] T049 [P] [US6] Create `ServiceApprovalCard.tsx` (shows title, executor, category, price, description, approve/reject actions) — RTL-aware in `msa3ed/UIS/components/admin/ServiceApprovalCard.tsx`
- [ ] T050 [US6] Add Service Approval queue section to `Admin/index.tsx` using `GET /Admin/Services/Pending` and approval/rejection actions in `msa3ed/UIS/app/Admin/index.tsx`

**Checkpoint**: US6 independently functional — zero service leakage to students confirmed by contract tests.

---

## Phase 7: US5 — Inbox Chat Improvements (Priority: P2)

**Goal**: Inbox shows media-type previews, real-time unread badges, contact search.

**Independent Test**: Open Inbox → see voice/image labels in last message → search contact name → tap row → scrolls to first unread.

### Tests for US5 ⚠️ Write FIRST

- [ ] T051 [P] [US5] BE contract test: `GET /Chat/Inbox` returns `lastMessageType`, `unreadCount` per conversation in `msa3ed/Uis.Tests/Chat/InboxTests.cs`
- [ ] T052 [P] [US5] BE contract test: `POST /Chat/Inbox/{chatId}/Read` updates `ChatReadReceipt.LastReadAt` in `msa3ed/Uis.Tests/Chat/MarkReadTests.cs`
- [ ] T053 [P] [US5] FE unit test: inbox search selector filters by contact name and last message content in `msa3ed/UIS/store/slices/__tests__/chatSlice.test.ts`
- [ ] T054 [P] [US5] FE snapshot test: `InboxRow.tsx` renders media-type label, unread badge, RTL layout in `msa3ed/UIS/components/__tests__/InboxRow.test.tsx`

### Implementation for US5

- [ ] T055 [US5] Extend `ChatController.cs` `GET /Chat/Inbox` to include `lastMessageType`, `unreadCount` (via `ChatReadReceipt`) in `msa3ed/server/Controllers/Api/ChatController.cs`
- [ ] T056 [P] [US5] Add `POST /Chat/Inbox/{chatId}/Read` endpoint updating `ChatReadReceipt` in `msa3ed/server/Controllers/Api/ChatController.cs`
- [ ] T057 [P] [US5] Create `InboxRow.tsx` (avatar, name, media-type label or text preview, unread badge, timestamp) — RTL-aware in `msa3ed/UIS/components/InboxRow.tsx`
- [ ] T058 [US5] Extend `inbox.tsx` with `InboxRow`, real-time unread increment via SignalR `ReceiveMessage`, search bar filtering, auto-scroll to first unread on open in `msa3ed/UIS/app/student/(tabs)/inbox.tsx`
- [ ] T059 [US5] Add `FilterChipBar.tsx` (dismissible chip badges for active filters) — RTL-aware in `msa3ed/UIS/components/FilterChipBar.tsx`

**Checkpoint**: US5 independently functional — inbox shows real-time unread, media labels, and search works.

---

## Phase 8: US7 — Advanced Search: Executors & Services (Priority: P2)

**Goal**: Students search with 7 filter dimensions; admin filters executor list.

**Independent Test**: Enter keyword + 3 filters → chip bar shows 3 chips → dismiss one → results update instantly.

### Tests for US7 ⚠️ Write FIRST

- [ ] T060 [P] [US7] BE contract test: `GET /ExecutorServices/Search` with all 7 filter params returns only `Active` services in `msa3ed/Uis.Tests/Search/ServiceSearchTests.cs`
- [ ] T061 [P] [US7] BE contract test: `GET /Admin/Executors` filters by name, specialty, status, join date in `msa3ed/Uis.Tests/Admin/ExecutorSearchTests.cs`
- [ ] T062 [P] [US7] BE unit test: `SearchService` correctly chains EF Where clauses for each filter param in `msa3ed/Uis.Tests/Services/SearchServiceTests.cs`
- [ ] T063 [P] [US7] FE unit test: `searchSlice` dispatches correct query params for all filter combinations in `msa3ed/UIS/store/slices/__tests__/searchSlice.test.ts`

### Implementation for US7

- [ ] T064 [P] [US7] Create `SubCategory` seed data migration and `GET /Categories/{id}/SubCategories` endpoint in `msa3ed/server/Controllers/Api/CategoriesController.cs`
- [ ] T065 [P] [US7] Create `GET /ExecutorServices/Search` endpoint wired to `SearchService`; only returns `Active` services in `msa3ed/server/Controllers/Api/ExecutorServicesController.cs`
- [ ] T066 [P] [US7] Create `AdminExecutorsController.cs` with `GET /Admin/Executors` filtered search in `msa3ed/server/Controllers/Api/Admin/AdminExecutorsController.cs`
- [ ] T067 [US7] Extend `AdvancedFilterSheet.tsx` with all 7 filter dimensions (category, subcategory, price range, min rating, availability, delivery days, sort order) wired to `searchSlice` in `msa3ed/UIS/components/AdvancedFilterSheet.tsx`
- [ ] T068 [US7] Update `search.tsx` to use `FilterChipBar`, `AdvancedFilterSheet`, and paginated `searchSlice` results in `msa3ed/UIS/app/student/search.tsx`
- [ ] T069 [US7] Add admin executor search with filters to `Admin/index.tsx` using `GET /Admin/Executors` in `msa3ed/UIS/app/Admin/index.tsx`

**Checkpoint**: US7 independently functional — all 7 filters work, chip bar dismisses individually, admin executor search works.

---

## Phase 9: US4 (Home) — Home Screen UIS Improvements (Priority: P2)

**Goal**: Home screen shows live data for all sections (Services, Executors, Offers, Projects) with skeleton loading and smooth animations.

**Independent Test**: Fresh session → Home loads in <2s → all 4 sections populated → pull-to-refresh updates data.

### Tests for US4-Home ⚠️ Write FIRST

- [ ] T070 [P] [US4] BE contract test: all 4 Home section endpoints return correct data shape in `msa3ed/Uis.Tests/Home/HomeDataTests.cs`
- [ ] T071 [P] [US4] FE snapshot test: Home screen renders skeleton placeholders during loading state in `msa3ed/UIS/app/__tests__/HomeScreen.test.tsx`

### Implementation for US4-Home

- [ ] T072 [P] [US4] Wire Offers section in `index.tsx` (student home) to `OfferController` endpoint with skeleton loading in `msa3ed/UIS/app/student/(tabs)/index.tsx`
- [ ] T073 [P] [US4] Wire Projects section in `index.tsx` to `ProjectsController` endpoint with skeleton loading in `msa3ed/UIS/app/student/(tabs)/index.tsx`
- [ ] T074 [US4] Add `react-native-reanimated` skeleton animation (shimmer effect) for all 4 Home sections; add pull-to-refresh handler in `msa3ed/UIS/app/student/(tabs)/index.tsx`

**Checkpoint**: Home screen shows live data with skeleton loading and smooth animations.

---

## Phase 10: Polish & Cross-Cutting Concerns

- [ ] T075 [P] Run all BE tests (`dotnet test`) — confirm 0 failures in `msa3ed/Uis.Tests/`
- [ ] T076 [P] Run all FE tests (`npx jest`) — confirm 0 failures in `msa3ed/UIS/`
- [ ] T077 [P] RTL validation: run Jest RTL snapshot suite for all new components; confirm no misaligned elements in `msa3ed/UIS/components/__tests__/`
- [ ] T078 [P] Add empty-state UI to search screen (no results → suggest broadening filters) in `msa3ed/UIS/app/student/search.tsx`
- [ ] T079 [P] Add `TicketMessage` rich media support (voice + attachments) to ticket screens in admin and student views in `msa3ed/UIS/app/Admin/index.tsx`
- [ ] T080 Run `quickstart.md` 6-step end-to-end smoke test and confirm all steps pass
- [ ] T081 Auto-commit all changes: `git add . && git commit -m "feat(013): implement rich chat media, admin service approval & advanced search"`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1/US2 (Phase 3)**: Depends on Phase 2 — no inter-story dependencies
- **US3 (Phase 4)**: Depends on Phase 2 — can run parallel with Phase 3
- **US4-Admin (Phase 5)**: Depends on Phase 3 + Phase 4 completion (reuses MessageBubble)
- **US6 (Phase 6)**: Depends on Phase 2 only — can run parallel with Phase 3/4
- **US5 (Phase 7)**: Depends on Phase 3 + Phase 4 (inbox shows media types)
- **US7 (Phase 8)**: Depends on Phase 2 (SearchService, SubCategory migration)
- **US4-Home (Phase 9)**: Depends on Phase 2 only — can run parallel
- **Polish (Phase 10)**: Depends on all prior phases

### Parallel Opportunities

```bash
# After Phase 2 completes, these can run simultaneously:
Phase 3 (Voice Recording)    # developer A
Phase 4 (Image/Video/File)   # developer B (different files)
Phase 6 (Service Approval)   # developer C (entirely different domain)
Phase 7 (Advanced Search)    # developer D
Phase 9 (Home Screen)        # developer E
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup (models + migrations)
2. Complete Phase 2: Foundational (services + hub + slice extensions)
3. Complete Phase 3: Voice Messages (US1 + US2)
4. Complete Phase 4: Image/Video/File (US3)
5. Complete Phase 6: Service Approval (US6)
6. **STOP and VALIDATE**: Run all tests → smoke test steps 1–3 from quickstart.md
7. Deploy/demo P1 MVP

### Incremental Delivery

- P1 complete → students can send voice/media, admin approves services
- Add US4-Admin → admin can moderate chat
- Add US5 → inbox improvements live
- Add US7 → advanced search live
- Add US4-Home → home screen polish live

---

## Notes

- `[P]` = different files, no incomplete-task dependencies
- All tests MUST be written and confirmed failing before implementation
- Each story phase checkpoint = independently deployable increment
- `T081` auto-commit runs only after T075 + T076 both pass (0 failures)
- Total tasks: **81** | P1 MVP tasks: **T001–T050** (50 tasks)

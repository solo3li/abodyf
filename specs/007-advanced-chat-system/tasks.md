# Tasks: Advanced Chat System

**Input**: Design documents from `/specs/007-advanced-chat-system/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install NuGet package `FFMpegCore` in `msa3ed/server/Uis.Server.csproj`
- [x] T002 [P] Install npm packages `expo-av`, `react-native-reanimated`, `react-native-svg` in `msa3ed/UIS/package.json`
- [x] T003 [P] Configure `react-native-reanimated/plugin` in `msa3ed/UIS/babel.config.js`
- [x] T004 Create `msa3ed/server/Services/AudioService.cs` and `msa3ed/server/Services/OfferService.cs` placeholders

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data models and SignalR infrastructure

- [x] T005 Update `Chat`, `Message`, and `CustomOffer` entities in `msa3ed/server/Models/AppModels.cs` per data-model.md
- [x] T006 Add `MessageAttachment` entity to `msa3ed/server/Models/AppModels.cs`
- [x] T007 [P] Create and apply EF Core migration `AddAdvancedChatFeatures` in `msa3ed/server/`
- [x] T008 Implement `PrivateChatHub` lifecycle methods in `msa3ed/server/Hubs/PrivateChatHub.cs`
- [x] T009 [P] Define `ChatDto`, `MessageDto`, and `OfferDto` in `msa3ed/server/DTOs/AppDtos.cs`
- [x] T010 Register `IAudioService`, `IOfferService`, and `PrivateChatHub` in `msa3ed/server/Program.cs`

---

## Phase 3: User Story 1 - Private Pre-Order Messaging (Inbox) (Priority: P1) 🎯 MVP

**Goal**: Enable direct messaging between students and executors before an order is placed.

**Independent Test**: Navigate to an executor's profile, click "Contact", and verify the chat appears in the new "Inbox" tab.

### Tests for User Story 1
- [x] T011 [P] [US1] Create integration test for private chat initiation in `msa3ed/Uis.Tests/PrivateChatTests.cs`
- [x] T012 [P] [US1] Create contract test for `GET /api/Chat/Inbox` in `msa3ed/Uis.Tests/ChatApiTests.cs`

### Implementation for User Story 1
- [x] T013 [US1] Implement `POST /api/Chat/Private/Initiate` and `GET /api/Chat/Inbox` in `msa3ed/server/Controllers/Api/ChatController.cs`
- [x] T014 [P] [US1] Create Inbox Redux slice and thunks in `msa3ed/UIS/store/slices/chatSlice.ts`
- [x] T015 [US1] Create Inbox tab screen with filtering UI in `msa3ed/UIS/app/student/inbox/index.tsx`
- [x] T016 [US1] Add "Contact Provider" action to `msa3ed/UIS/app/shared/ServiceDetails.tsx`
- [x] T017 [US1] Integrate `PrivateChatHub` connection in `msa3ed/UIS/app/shared/chat/ChatScreen.tsx`

---

## Phase 4: User Story 2 - Custom Offers (Priority: P1)

**Goal**: Allow executors to send tailored price/delivery quotes within private chats.

**Independent Test**: Executor sends offer -> Student sees offer widget -> Student clicks "Accept" -> Redirects to checkout.

### Tests for User Story 2
- [x] T018 [P] [US2] Create unit tests for offer status transitions in `msa3ed/Uis.Tests/OfferServiceTests.cs`
- [x] T019 [P] [US2] Create integration test for offer-to-order conversion in `msa3ed/Uis.Tests/OrderFlowTests.cs`

### Implementation for User Story 2
- [x] T020 [US2] Implement `OfferService` logic for converting accepted offers to `Order` entities in `msa3ed/server/Services/OfferService.cs`
- [x] T021 [US2] Implement `POST /api/Offer`, `/Withdraw`, and `/Accept` in `msa3ed/server/Controllers/Api/OfferController.cs`
- [x] T022 [P] [US2] Create `CustomOffer` display widget in `msa3ed/UIS/components/CustomOffer.tsx`
- [x] T023 [US2] Implement "Create Custom Offer" modal and form in `msa3ed/UIS/app/shared/chat/components/OfferForm.tsx`
- [x] T024 [US2] Add offer support to SignalR listeners in `msa3ed/UIS/store/slices/chatSlice.ts`

---

## Phase 5: User Story 3 - Rich Media Attachments (Priority: P1)

**Goal**: Support sending multiple images and documents in any chat context.

**Independent Test**: Send 3 images in one message; verify all render as a gallery/grid in the chat feed.

### Tests for User Story 3
- [x] T025 [P] [US3] Create integration test for multi-part file uploads in `msa3ed/Uis.Tests/FileAttachmentTests.cs`

### Implementation for User Story 3
- [x] T026 [US3] Update `POST /api/Chat/{chatId}/Message` to handle `IFormFileCollection` for attachments in `msa3ed/server/Controllers/Api/ChatController.cs`
- [x] T027 [US3] Implement logic to save multiple `MessageAttachment` records in `msa3ed/server/Services/ChatService.cs`
- [x] T028 [P] [US3] Implement multi-file picker logic in `msa3ed/UIS/app/shared/chat/components/ChatInput.tsx`
- [x] T029 [US3] Update message feed to render image galleries and document icons in `msa3ed/UIS/app/shared/chat/components/MessageItem.tsx`

---

## Phase 6: User Story 4 - Voice Recording with Visualization (Priority: P2)

**Goal**: Capture voice messages with real-time waveform and server-side peak extraction for instant rendering.

**Independent Test**: Record voice (see active visualizer) -> Preview -> Send -> View static waveform in chat feed.

### Tests for User Story 4
- [x] T030 [P] [US4] Create unit test for FFmpeg peak extraction in `msa3ed/Uis.Tests/AudioServiceTests.cs`

### Implementation for User Story 4
- [x] T031 [US4] Implement FFmpeg-based peak extraction (50-100 points) in `msa3ed/server/Services/AudioService.cs`
- [x] T032 [P] [US4] Create `Waveform` SVG/Reanimated component in `msa3ed/UIS/components/Waveform.tsx`
- [x] T033 [US4] Implement `VoiceRecorder` with real-time input mapping in `msa3ed/UIS/app/shared/chat/components/VoiceRecorder.tsx`
- [x] T034 [US4] Implement `VoicePlayer` using server-provided `WaveformData` in `msa3ed/UIS/app/shared/chat/components/VoicePlayer.tsx`
- [x] T035 [US4] Add `UserRecording` SignalR event handling in `msa3ed/UIS/app/shared/chat/ChatScreen.tsx`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Platform-wide improvements and edge case handling.

- [x] T036 Update Admin Panel `TicketDetails` and `ChatLogs` views to render rich media in `msa3ed/server/Views/Admin/`
- [x] T037 Implement "Starred" and "Unread" filter logic in `msa3ed/server/Controllers/Api/ChatController.cs`
- [x] T038 Implement maximum file size (20MB) validation in both `msa3ed/UIS/` and `msa3ed/server/`
- [x] T039 [P] Add offline recording persistence and auto-retry logic in `msa3ed/UIS/services/ChatSyncService.ts`
- [x] T040 Run final validation using `specs/007-advanced-chat-system/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - Start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all User Stories.
- **User Stories (Phase 3-6)**: All depend on Phase 2. Can proceed in priority order (P1 → P2).
- **Polish (Phase 7)**: Depends on all stories being functional.

### Parallel Opportunities
- Backend and Frontend tasks within the same story (e.g., T013 and T014) can be worked on in parallel once DTOs (T009) are defined.
- Phase 3, 4, and 5 are all P1 and can be worked on in parallel after Phase 2 is complete.

---

## Implementation Strategy

### MVP First (User Story 1 & 2)
1. Complete Setup and Foundation.
2. Complete US1 (Private Inbox) to enable pre-order chat.
3. Complete US2 (Custom Offers) to enable the revenue-generating flow.

### Incremental Delivery
- **Increment 1**: Foundation + Private Inbox (Negotiation enabled).
- **Increment 2**: Custom Offers (Tailored deals enabled).
- **Increment 3**: Rich Media & Voice (Professional communication features).

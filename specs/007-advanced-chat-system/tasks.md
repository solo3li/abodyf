# Tasks: Advanced Chat System

**Input**: Design documents from `/specs/007-advanced-chat-system/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are requested in the implementation plan (xUnit for Backend, Jest for Frontend). Tasks include these tests to ensure data integrity and proper real-time behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `msa3ed/server/`
- **Frontend**: `msa3ed/UIS/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Verify backend build and existing tests in msa3ed/server/
- [ ] T002 [P] Verify frontend build and existing tests in msa3ed/UIS/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Update `Chat` and `Message` models in msa3ed/server/Models/AppModels.cs
- [ ] T004 Create `CustomOffer` model in msa3ed/server/Models/AppModels.cs
- [ ] T005 [P] Update `ApplicationDbContext` with `CustomOffers` DbSet and relationship configurations in msa3ed/server/Data/ApplicationDbContext.cs
- [ ] T006 [P] Create and apply EF migration for the new Chat entities and CustomOffer in msa3ed/server/
- [ ] T007 Create `PrivateChatHub` in msa3ed/server/Hubs/PrivateChatHub.cs
- [ ] T008 [P] Register `PrivateChatHub` in msa3ed/server/Program.cs routing
- [ ] T009 Create a generalized `chatSlice.ts` or update existing to support multiple hubs in msa3ed/UIS/store/slices/chatSlice.ts
- [ ] T010 Update `signalr.ts` to support initializing and managing the `PrivateChatHub` connection in msa3ed/UIS/services/signalr.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Private Pre-Order Messaging (Inbox) (Priority: P1) 🎯 MVP

**Goal**: Allow Students and Executors to message privately without an active order via a dedicated Inbox.

**Independent Test**: Initiate a private chat from a profile, send a message, and view it in the unified Inbox tab.

### Tests for User Story 1

- [ ] T011 [P] [US1] Create xUnit test for private chat initialization and retrieval in msa3ed/server/Uis.Tests/ChatControllerTests.cs
- [ ] T012 [P] [US1] Create Jest test for Redux `chatSlice` fetching private inbox list in msa3ed/UIS/store/__tests__/chatSlice.test.ts

### Implementation for User Story 1

- [ ] T013 [US1] Implement `InitializePrivateChatAsync` and `GetInboxAsync` in msa3ed/server/Services/ChatService.cs
- [ ] T014 [US1] Implement `POST /api/Chat/Private` and `GET /api/Chat/Inbox` endpoints in msa3ed/server/Controllers/Api/ChatController.cs
- [ ] T015 [US1] Update `PrivateChatHub` to handle `SendMessage` and broadcast `ReceiveMessage` appropriately in msa3ed/server/Hubs/PrivateChatHub.cs
- [ ] T016 [US1] Create the dedicated Inbox tab UI in msa3ed/UIS/app/student/(tabs)/inbox.tsx
- [ ] T017 [US1] Add "Contact Provider" button to Executor profiles leading to the private chat screen in msa3ed/UIS/app/student/executor/[id].tsx
- [ ] T018 [US1] Implement the private chat messaging UI in msa3ed/UIS/app/shared/chat/private/[id].tsx

**Checkpoint**: User Story 1 (Private Inbox) should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Custom Offers (Priority: P1)

**Goal**: Allow Executors to send actionable Custom Offers within private chats.

**Independent Test**: Executor sends a custom offer widget, Student sees it and clicks "Accept".

### Tests for User Story 2

- [ ] T019 [P] [US2] Create xUnit test for sending and accepting Custom Offers in msa3ed/server/Uis.Tests/ChatControllerTests.cs

### Implementation for User Story 2

- [ ] T020 [US2] Implement `SendCustomOfferAsync` and `AcceptCustomOfferAsync` in msa3ed/server/Services/ChatService.cs
- [ ] T021 [US2] Implement `POST /api/Chat/Offers` and `POST /api/Chat/Offers/{id}/Accept` in msa3ed/server/Controllers/Api/ChatController.cs
- [ ] T022 [US2] Update `PrivateChatHub` to handle `SendCustomOffer` and broadcast `ReceiveCustomOffer` in msa3ed/server/Hubs/PrivateChatHub.cs
- [ ] T023 [US2] Create a "Create Offer" UI modal/sheet for Executors in msa3ed/UIS/app/shared/chat/components/CreateOfferModal.tsx
- [ ] T024 [US2] Implement the `CustomOfferWidget` to render offers inline within the chat feed in msa3ed/UIS/app/shared/chat/components/CustomOfferWidget.tsx
- [ ] T025 [US2] Connect the "Accept" button on the widget to the order creation flow in msa3ed/UIS/app/shared/chat/private/[id].tsx

**Checkpoint**: User Story 2 (Custom Offers) should be fully functional and testable independently within the private chat context.

---

## Phase 5: User Story 3 - Rich Media Attachments (Priority: P1)

**Goal**: Allow users to send images and document files up to 20MB in any chat context.

**Independent Test**: Upload an image/document via the attachment icon and verify it renders inline or as a downloadable link.

### Tests for User Story 3

- [ ] T026 [P] [US3] Create xUnit test for attachment uploads and 20MB limit validation in msa3ed/server/Uis.Tests/ChatControllerTests.cs

### Implementation for User Story 3

- [ ] T027 [US3] Implement `POST /api/Chat/Attachments` endpoint with size validation in msa3ed/server/Controllers/Api/ChatController.cs
- [ ] T028 [US3] Ensure `ChatService.SendMessageAsync` properly handles `AttachmentUrl` and `AttachmentType` payloads in msa3ed/server/Services/ChatService.cs
- [ ] T029 [US3] Integrate `expo-document-picker` and `expo-image-picker` into the chat input component in msa3ed/UIS/app/shared/chat/components/ChatInput.tsx
- [ ] T030 [US3] Implement UI components to render image thumbnails and document links inline in the chat feed in msa3ed/UIS/app/shared/chat/components/MessageBubble.tsx

**Checkpoint**: User Story 3 (Rich Media) should be fully functional across all chat contexts.

---

## Phase 6: User Story 4 - Voice Recording with Visualization (Priority: P2)

**Goal**: Allow users to record, preview, and send voice messages with real-time waveform visualizers.

**Independent Test**: Hold microphone to record, verify live visualization, preview, send, and play back the audio in the chat feed.

### Implementation for User Story 4

- [ ] T031 [US4] Update `ChatService.SendMessageAsync` to handle `Audio` attachment types explicitly if necessary in msa3ed/server/Services/ChatService.cs
- [ ] T032 [US4] Integrate `expo-av` for audio recording and playback management in msa3ed/UIS/app/shared/chat/components/AudioRecorder.tsx
- [ ] T033 [US4] Implement real-time dynamic waveform visualization during recording in msa3ed/UIS/app/shared/chat/components/AudioRecorder.tsx
- [ ] T034 [US4] Implement a playable audio component with a static waveform for sent messages in msa3ed/UIS/app/shared/chat/components/AudioPlayerWidget.tsx
- [ ] T035 [US4] Integrate the audio recorder and player into the main chat interfaces in msa3ed/UIS/app/shared/chat/private/[id].tsx and active order chats.

**Checkpoint**: User Story 4 (Voice Recording) should be fully functional and testable independently.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T036 Update `ChatHub` (existing order chats) to support the new `MessagePayload` structure (attachments, audio) in msa3ed/server/Hubs/ChatHub.cs
- [ ] T037 [P] Update API documentation in specs/007-advanced-chat-system/contracts/api.md
- [ ] T038 Add the new "Inbox" tab to the bottom navigation bar for all users in msa3ed/UIS/app/student/(tabs)/_layout.tsx
- [ ] T039 Run quickstart.md validation to confirm all scenarios pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup
- **User Stories (Phase 3+)**: All depend on Foundational
- **Polish (Final Phase)**: Depends on all user stories

### User Story Dependencies

- **User Story 1 (P1)**: Independent
- **User Story 2 (P1)**: Depends on US1 (Custom offers happen inside private chats)
- **User Story 3 (P1)**: Independent of US1/US2, but easier to implement once US1 UI is established
- **User Story 4 (P2)**: Independent, but relies on US3's generic attachment handling infrastructure

### Parallel Opportunities

- T001, T002 (Setup)
- T005, T006, T008 (Foundational)
- Backend tests (T011, T019, T026) can be written in parallel
- Frontend tests (T012) can be written in parallel
- Once the foundational phase is complete, backend endpoints (T014, T021, T027) can be built in parallel with frontend UI scaffolding (T016, T023, T029, T032).

---

## Implementation Strategy

### MVP First (Inbox + Attachments)

1. Complete Phase 1 & 2
2. Complete Phase 3 (Private Inbox)
3. Complete Phase 5 (Rich Media Attachments)
4. **VALIDATE**: Ensure users can message privately and share files.

### Incremental Delivery

1. Add Custom Offers (US2) to enable monetization via private chats.
2. Add Voice Recording (US4) to enhance user experience.
3. Final Polish, extending features to all chat contexts (Orders, Tickets).

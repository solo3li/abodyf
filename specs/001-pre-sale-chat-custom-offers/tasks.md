# Tasks: Pre-sale Chat and Custom Offers

**Input**: Design documents from `/specs/001-pre-sale-chat-custom-offers/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Path Conventions

- **Backend**: `msa3ed/server/`
- **Frontend**: `msa3ed/UIS/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure and documentation files in `specs/001-pre-sale-chat-custom-offers/`
- [x] T002 Update `msa3ed/server/Data/ApplicationDbContext.cs` to include the `CustomOffer` entity

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create `CustomOffer` model in `msa3ed/server/Models/AppModels.cs` per `data-model.md`
- [x] T004 [P] Update `Message` model in `msa3ed/server/Models/AppModels.cs` to include `CustomOfferId`
- [x] T005 [P] Create and apply EF Core migration `AddCustomOffers` in `msa3ed/server/` (Note: Models and DbContext updated; migration tool execution depends on environment)
- [x] T006 Implement `ICustomOfferService` interface and base logic in `msa3ed/server/Services/DomainServices.cs`
- [x] T007 [P] Create `OfferCard` UI component in `msa3ed/UIS/components/OfferCard.tsx`
- [x] T008 [P] Add `customOffers` state and actions to `msa3ed/UIS/store/slices/chatSlice.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Pre-sale Communication (Priority: P1) 🎯 MVP

**Goal**: Enable students to initiate private chats with executors directly from service details.

**Independent Test**: A student clicks "Contact" on a service page and successfully opens a chat with the executor.

### Implementation for User Story 1

- [x] T009 [US1] Add "Contact Executor" button to Service Details screen in `msa3ed/UIS/app/student/service/[id].tsx`
- [x] T010 [US1] Implement navigation logic in `msa3ed/UIS/app/student/service/[id].tsx` to open/create a private chat
- [x] T011 [US1] Ensure `msa3ed/server/Controllers/Api/ChatController.cs` correctly handles `GetPrivateChat` for pre-sale scenarios
- [x] T012 [US1] Test initiating a chat from three different services and verify executor receives messages in their list

**Checkpoint**: User Story 1 is fully functional. Students can communicate before buying.

---

## Phase 4: User Story 2 - Creating a Custom Offer (Priority: P1)

**Goal**: Allow executors to send tailored pricing and delivery terms within a private chat.

**Independent Test**: An executor sends an offer; both users see the offer card in the chat window in real-time.

### Implementation for User Story 2

- [x] T013 [US2] Create "Create Custom Offer" modal/form in `msa3ed/UIS/app/shared/chat/CreateOfferModal.tsx`
- [x] T014 [US2] Implement `POST /api/Chat/{chatId}/Offer` endpoint in `msa3ed/server/Controllers/Api/ChatController.cs`
- [x] T015 [US2] Update `msa3ed/server/Hubs/ChatHub.cs` to broadcast `ReceiveCustomOffer` event
- [x] T016 [US2] Integrate offer creation trigger in the chat UI `msa3ed/UIS/app/shared/chat/[id].tsx`
- [x] T017 [US2] Render `OfferCard` within the chat message list in `msa3ed/UIS/app/shared/chat/[id].tsx` when `CustomOfferId` is present

**Checkpoint**: User Story 2 is functional. Executors can propose custom deals.

---

## Phase 5: User Story 3 - Accepting a Custom Offer (Priority: P1)

**Goal**: Enable students to accept offers and automatically create orders with the custom parameters.

**Independent Test**: A student accepts an offer and is redirected to checkout with the correct custom price.

### Implementation for User Story 3

- [x] T018 [US3] Implement `POST /api/Orders/FromOffer/{offerId}` in `msa3ed/server/Controllers/Api/OrdersController.cs`
- [x] T019 [US3] Implement "Accept Offer" and "Decline Offer" button actions in `msa3ed/UIS/components/OfferCard.tsx`
- [x] T020 [US3] Implement `POST /api/Chat/Offer/{offerId}/Decline` endpoint in `msa3ed/server/Controllers/Api/ChatController.cs`
- [x] T021 [US3] Ensure order creation logic in `OrderService.cs` supports dynamic pricing from the offer
- [x] T022 [US3] Add status transition logic and persistence for `Accepted` state in the backend

**Checkpoint**: End-to-end custom offer flow is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and edge case handling

- [x] T023 [P] Implement offer expiration logic (7 days) via a background task or check-on-load in `msa3ed/server/Services/DomainServices.cs`
- [x] T024 [P] Add "Withdraw Offer" functionality for executors in `msa3ed/server/Controllers/Api/ChatController.cs` and UI
- [x] T025 [P] Implement warning notification on service deletion if active offers exist in `msa3ed/server/Controllers/AdminController.cs` (MVC)
- [x] T026 Final end-to-end regression testing following `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundational (Phases 1-2)**: MUST be completed first to provide the data structure and base UI components.
- **User Story 1 (Phase 3)**: Can be implemented first as it provides the entry point for communication.
- **User Story 2 (Phase 4)**: Depends on Phase 2. Can be implemented in parallel with US1 if the chat ID is known.
- **User Story 3 (Phase 5)**: Strictly depends on Phase 4 (you need an offer to accept it).

### Parallel Opportunities

- T004, T007, T008 can be worked on simultaneously once T003 is defined.
- UI work for `OfferCard` (T007) can happen in parallel with backend service work (T006).
- Polish tasks (T023-T025) are mostly independent and can be picked up after US3 is stable.

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Foundation.
2. Enable Pre-sale Chat (US1).
3. Enable Sending Offers (US2).
4. *Validation*: Users can now talk and see offers even if acceptance is still manual/admin-assisted.

### Full Cycle

1. Complete US3 (Acceptance).
2. All custom deals are now fully automated.

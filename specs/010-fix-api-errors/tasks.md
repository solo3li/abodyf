# Tasks: fix-api-signalr-errors

**Input**: Design documents from `/specs/010-fix-api-errors/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Ensure PostgreSQL is running via `docker-compose up -d` in project root
- [x] T002 Verify backend environment variables in `msa3ed/server/appsettings.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Apply database migrations via `dotnet ef database update` in `msa3ed/server/`
- [x] T004 Create xUnit test base class for API integration tests in `msa3ed/Uis.Tests/ApiTestBase.cs`
- [x] T005 [P] Implement structured logging for API exceptions in `msa3ed/server/Program.cs`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Viewing Personal Wallet (Priority: P1) 🎯 MVP

**Goal**: Ensure the `/api/Wallet` endpoint correctly returns balance and transactions for the authenticated user.

**Independent Test**: `curl -X GET http://localhost:5035/api/Wallet -H "Authorization: Bearer <token>"` returns 200 OK.

### Tests for User Story 1

- [x] T006 [P] [US1] Create contract test for `GET /api/Wallet` in `msa3ed/Uis.Tests/WalletControllerTests.cs` (Verify 404 for missing user)
- [x] T007 [P] [US1] Create integration test for wallet data retrieval in `msa3ed/Uis.Tests/WalletControllerTests.cs` (Verify 200 for existing user)

### Implementation for User Story 1

- [x] T008 [US1] Fix `GetWallet` action in `msa3ed/server/Controllers/Api/WalletController.cs` to return `NotFound` if user record is missing.
- [x] T009 [US1] Add transaction history retrieval logic to `WalletService.cs` in `msa3ed/server/Services/` if not fully populated.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Real-time Communication (Priority: P2)

**Goal**: Resolve SignalR negotiation failures and ensure connection stability.

**Independent Test**: SignalR client (JS/TS) connects to `/hubs/chat` without `net::ERR_FAILED`.

### Implementation for User Story 2

- [x] T010 [US2] Audit and fix `app.UseCors("AllowAll")` placement in `msa3ed/server/Program.cs` (must be before `app.UseRouting` or mapped hubs)
- [x] T011 [US2] Update `ChatHub` mapping and CORS options in `msa3ed/server/Program.cs` to explicitly support negotiation with credentials.
- [x] T012 [US2] Verify SignalR connection from mobile frontend `msa3ed/UIS/services/signalr.ts`.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Accepting Available Orders (Priority: P2)

**Goal**: Fix the 404 error when an executor attempts to accept a pending order.

**Independent Test**: `POST /api/Orders/{id}/Accept` returns 200 OK and changes order status to `InProgress`.

### Tests for User Story 3

- [x] T013 [P] [US3] Create contract test for `POST /api/Orders/{id}/Accept` in `msa3ed/Uis.Tests/OrdersControllerTests.cs`.

### Implementation for User Story 3

- [x] T014 [US3] Verify route registration for `Accept` action in `msa3ed/server/Controllers/Api/ApiControllers.cs`.
- [x] T015 [US3] Implement status validation in `OrderService.AcceptOrderAsync` (must be "Pending") in `msa3ed/server/Services/DomainServices.cs`.

**Checkpoint**: User Stories 1, 2, and 3 should now be functional.

---

## Phase 6: User Story 4 - Viewing Inbox (Priority: P3)

**Goal**: Resolve the 500 Internal Server Error in the Chat Inbox endpoint.

**Independent Test**: `GET /api/Chat/Inbox` returns 200 OK with a list of private chats.

### Tests for User Story 4

- [x] T016 [P] [US4] Create reproduction test case for `GetInboxAsync` 500 error in `msa3ed/Uis.Tests/ChatControllerTests.cs`.

### Implementation for User Story 4

- [x] T017 [US4] Refactor `GetInboxAsync` in `msa3ed/server/Services/DomainServices.cs` (ChatService) to remove non-translatable `ToByteArray()` calls.
- [x] T018 [US4] Update `GetInbox` action in `msa3ed/server/Controllers/Api/ApiControllers.cs` to handle empty inbox gracefully.

**Checkpoint**: All user stories should now be independently functional

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T019 Run all backend tests via `dotnet test` in `msa3ed/server/`.
- [x] T020 Run linter and formatter on backend code.
- [x] T021 Validate all fixes via `quickstart.md` manual steps.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all user stories being complete

### Parallel Opportunities

- T001, T002 (Setup)
- T005 (Foundational)
- All US1, US3, US4 test tasks marked [P]
- US1, US2, US3, US4 can proceed in parallel once Phase 2 is done.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **VALIDATE**: Run `curl` to verify Wallet endpoint.

### Incremental Delivery

1. Foundation ready → Start US1 (Wallet)
2. Add US2 (SignalR) → Test real-time connection
3. Add US3 (Order Accept) → Test executor workflow
4. Add US4 (Inbox) → Test messaging list
5. Polish and final test run.

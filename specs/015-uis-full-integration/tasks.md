# Tasks: uis-full-integration

**Input**: Design documents from `/specs/015-uis-full-integration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: TDD is not explicitly requested; verification will follow the manual test criteria per user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Configure development environment and verify current server status in `msa3ed/server`
- [ ] T002 [P] Synchronize git branch and baseline for 015 feature in repository root
- [ ] T003 Initialize database migrations for new entities and relationship updates in `msa3ed/server/Data/ApplicationDbContext.cs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Implement `NotificationHub` updates for real-time status alerts in `msa3ed/server/Hubs/NotificationHub.cs`
- [ ] T005 [P] Update `AdminController` with base routes for new entities in `msa3ed/server/Controllers/AdminController.cs`
- [ ] T006 [P] Create shared partial views for manual verification modals in `msa3ed/server/Views/Shared/_ManualVerificationModal.cshtml`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Financial Management (Priority: P1) 🎯 MVP

**Goal**: Enable manual deposits and withdrawals with admin verification and real-time balance updates.

**Independent Test**: Submit a deposit/withdrawal from mobile, verify in admin dashboard, resolve, and check real-time balance update.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Create `Deposits` list view in `msa3ed/server/Views/Admin/Deposits.cshtml`
- [ ] T008 [P] [US1] Create `Withdrawals` list view in `msa3ed/server/Views/Admin/Withdrawals.cshtml`
- [ ] T009 [US1] Implement `ResolveDeposit` action with audit logging in `msa3ed/server/Controllers/AdminController.cs`
- [ ] T010 [US1] Implement `ResolveWithdrawal` action with proof upload in `msa3ed/server/Controllers/AdminController.cs`
- [ ] T011 [P] [US1] Create Wallet Screen in mobile app `msa3ed/mobile/src/screens/WalletScreen.tsx`
- [ ] T012 [US1] Implement `walletSlice` for real-time balance tracking in `msa3ed/mobile/src/store/walletSlice.ts`
- [ ] T013 [US1] Integrate `expo-image-picker` for screenshot uploads in `msa3ed/mobile/src/screens/WalletScreen.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Quality Assurance (Priority: P2)

**Goal**: Allow students to rate and review executors, updating their stats in real-time.

**Independent Test**: Leave a 5-star review as a student and verify the executor's average rating updates immediately on their profile.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Create Review Modal UI in `msa3ed/mobile/src/screens/ReviewModal.tsx`
- [ ] T015 [US2] Implement `POST /api/Reviews` endpoint in `msa3ed/server/Controllers/Api/ReviewsController.cs`
- [ ] T016 [US2] Implement rating aggregation logic in `ReviewService.cs` and `User.cs` model update
- [ ] T017 [US2] Integrate review submission into the mobile order completion flow

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Conflict Resolution (Priority: P3)

**Goal**: Provide a formal dispute mechanism for unsatisfied users with admin arbitration.

**Independent Test**: Open a dispute from an order, review evidence as admin, and resolve with a refund.

### Implementation for User Story 3

- [ ] T018 [P] [US3] Create `Dispute` management list view in `msa3ed/server/Views/Admin/Disputes.cshtml`
- [ ] T019 [US3] Implement `ResolveDispute` action with resolution types (Refund/Release) in `AdminController.cs`
- [ ] T020 [US3] Create "Open Dispute" form in mobile order details screen `msa3ed/mobile/src/screens/OrderDetailsScreen.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T021 [P] Verify RTL compliance for all new mobile screens (Wallet, Review, Dispute)
- [ ] T022 [P] Performance audit: verify dashboard list loading time < 500ms
- [ ] T023 Run `quickstart.md` validation on clean environment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel
- Models within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all UI tasks for User Story 1 together:
Task: "Create Deposits list view in msa3ed/server/Views/Admin/Deposits.cshtml"
Task: "Create Withdrawals list view in msa3ed/server/Views/Admin/Withdrawals.cshtml"
Task: "Create Wallet Screen in mobile app msa3ed/mobile/src/screens/WalletScreen.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

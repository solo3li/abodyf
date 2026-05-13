# Tasks: Full Project Execution and Verification

**Input**: Design documents from `/specs/009-verification-testing/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Ensure PostgreSQL container is running via `docker-compose up -d`
- [x] T002 Verify backend environment variables in `msa3ed/server/appsettings.json`
- [x] T003 [P] Verify frontend API base URL in `msa3ed/UIS/services/api.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Apply pending database migrations via `dotnet ef database update` in `msa3ed/server/`
- [x] T005 Seed initial data (Admin, Student, Executor roles and users) via `dotnet run --seed` (if applicable) or manual SQL
- [x] T006 Verify global system settings (Commission Rate) in `GeneralSettings` view

**Checkpoint**: Foundation ready - user story implementation and testing can now begin.

---

## Phase 3: User Story 1 - Full Stack Local Execution (Priority: P1) 🎯 MVP

**Goal**: Successfully run both backend and frontend and verify they communicate.

**Independent Test**: App home screen loads services from the backend.

### Implementation for User Story 1

- [x] T007 [US1] Run the ASP.NET Core backend using `dotnet run` in `msa3ed/server/`
- [x] T008 [US1] Start the Expo mobile app using `npx expo start` in `msa3ed/UIS/`
- [x] T009 [US1] Verify that the mobile app successfully authenticates a test student user
- [x] T010 [US1] Confirm that the Home screen displays services fetched from the `ServicesController`

**Checkpoint**: Full stack is operational.

---

## Phase 4: User Story 2 - Comprehensive API Validation (Priority: P1)

**Goal**: Validate all backend endpoints for correct responses and schema compliance.

**Independent Test**: All endpoints return 200 OK with valid payloads.

### Implementation for User Story 2

- [x] T011 [P] [US2] Test `GET /api/Services` with multi-filters (search, category, price) in `msa3ed/server/Controllers/Api/ApiControllers.cs`
- [x] T012 [P] [US2] Test `GET /Admin/Wallets` and verify it displays all user balances in `msa3ed/server/Controllers/AdminController.cs`
- [x] T013 [P] [US2] Test `GET /Admin/AuditLogs` and verify it displays recent system actions
- [x] T014 [P] [US2] Test `POST /Admin/AdjustBalance` for both Credit and Debit operations
- [x] T015 [US2] Verify role-based access control (RBAC) on all Admin endpoints (Unauthorized access should return 401/403)

**Checkpoint**: API is reliable and secure.

---

## Phase 5: User Story 3 - Business Logic Verification (Priority: P2)

**Goal**: Verify financial flows (Escrow, Commission, Transfers).

**Independent Test**: Correct balances in Student, Executor, and Platform wallets after order completion.

### Implementation for User Story 3

- [x] T016 [US3] Perform a "Perfect Order" cycle: Create -> Accept -> Complete in `msa3ed/server/Controllers/Api/ApiControllers.cs`
- [x] T017 [US3] Verify student wallet deduction and escrow hold upon order creation
- [x] T018 [US3] Verify executor wallet credit and platform commission deduction upon order completion
- [x] T019 [US3] Verify that a corresponding `AuditLog` entry is created for the escrow release action
- [x] T020 [US3] Test "Insufficient Balance" edge case for order creation

**Checkpoint**: Financial logic is verified.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: UI/UX consistency and final verification.
### Implementation Strategy

- [x] T021 [P] Verify RTL alignment on the Profile screen after the recent `row-reverse` changes in `msa3ed/UIS/app/student/(tabs)/profile.tsx`
- [x] T022 [P] Confirm the "Accept" and "Complete" buttons are localized correctly (Arabic text)
- [x] T023 Run final verification of the `quickstart.md` documentation to ensure it is accurate
- [x] T024 Perform a final check of the console logs for any unhandled exceptions or warnings
---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup.
- **User Stories (Phases 3-5)**: All depend on Foundational completion.
- **Polish (Phase 6)**: Done after all user stories are verified.

### Parallel Opportunities

- All Admin API tests (T012-T014) can be run in parallel.
- Frontend RTL check (T021) can be run in parallel with API validation.

---

## Implementation Strategy

### MVP First
1. Start the project (Phases 1-3).
2. Validate the core Order API (Phase 4).
3. Verify the Escrow release (Phase 5).

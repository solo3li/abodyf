# Tasks: Executor Marketplace Expansion

**Input**: Design documents from `/specs/010-executor-marketplace-expansion/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The tasks below MUST include test tasks for both frontend and backend as per Constitution Principle III. Tests MUST be written FIRST and ensure they FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Install `expo-blur` and `react-native-linear-gradient` in `msa3ed/UIS/package.json`
- [x] T002 [P] Create `msa3ed/server/Services/GalleryService.cs` and `msa3ed/server/Services/ApprovalService.cs` skeletons

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create EF Core migration for `GalleryItem` and `ServiceApprovalLog` tables in `msa3ed/server/Data/`
- [x] T004 [P] Update `ApplicationDbContext.cs` with new `DbSet` properties for Gallery and Approval logs
- [x] T005 [P] Implement base `IGalleryService` and `IApprovalService` interfaces in `msa3ed/server/Services/`
- [x] T006 Register new services in `msa3ed/server/Program.cs`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Pro Executor Workspace (Priority: P1) 🎯 MVP

**Goal**: Organize specialized tools in a modern sidebar for Executors only.

**Independent Test**: Login as Executor -> See "Executor Console" in sidebar. Login as Student -> Do NOT see it.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [P] [US1] Frontend unit test for role-based sidebar rendering in `msa3ed/UIS/components/__tests__/SidebarContent.test.tsx`

### Implementation for User Story 1

- [x] T008 [US1] Update `msa3ed/UIS/components/SidebarContent.tsx` with role-based visibility logic for executor tabs
- [x] T009 [US1] Implement glassmorphism styling in `msa3ed/UIS/components/SidebarContent.tsx` using `BlurView`
- [x] T010 [P] [US1] Add "Professional Badge" section to sidebar in `msa3ed/UIS/components/SidebarContent.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Admin Service Arbitration (Priority: P1) 🎯 MVP

**Goal**: Implement Admin approval dashboard for new service offerings.

**Independent Test**: Submit service as Executor -> Status is `PendingApproval`. Admin approves -> Status is `Active`.

### Tests for User Story 2 ⚠️

- [x] T011 [P] [US2] Backend unit test for service approval state transitions in `msa3ed/Uis.Tests/Services/ApprovalServiceTests.cs`

### Implementation for User Story 2

- [x] T012 [US2] Implement `ApproveServiceAsync` and `RejectServiceAsync` in `msa3ed/server/Services/ApprovalService.cs`
- [x] T013 [US2] Create `Admin/Services/Approvals` endpoint in `msa3ed/server/Controllers/AdminController.cs`
- [x] T014 [US2] Implement "Pending Services" list view in `msa3ed/server/Views/Admin/PendingServices.cshtml`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Advanced Search & Discovery (Priority: P2)

**Goal**: Tabbed search for services and professionals with recency-driven sorting.

**Independent Test**: Search for "Design" -> Toggle between Services and Pros tabs -> See results.

### Tests for User Story 3 ⚠️

- [x] T015 [P] [US3] Backend contract test for `GET /api/Executors` with searchTerm in `msa3ed/Uis.Tests/Controllers/ExecutorsControllerTests.cs`
- [x] T016 [P] [US3] Frontend unit test for Search tab toggle in `msa3ed/UIS/app/__tests__/search.test.tsx`

### Implementation for User Story 3

- [x] T017 [P] [US3] Implement `GET /api/Executors` discovery endpoint in `msa3ed/server/Controllers/Api/ExecutorsController.cs`
- [x] T018 [US3] Update `CatalogService.cs` to default `GetServicesAsync` results to recency-driven order
- [x] T019 [US3] Create `msa3ed/UIS/app/student/search.tsx` with tabbed navigator (Services vs Pros)
- [x] T020 [US3] Implement search filter bar in `msa3ed/UIS/app/student/search.tsx`

**Checkpoint**: All core discovery features should now be independently functional

---

## Phase 6: User Story 4 - Executor Portfolios & Work Gallery (Priority: P2)

**Goal**: Allow executors to showcase work and students to initiate direct chat.

**Independent Test**: View executor profile -> See gallery items -> Click "Chat Now" -> Open chat.

### Tests for User Story 4 ⚠️

- [x] T021 [P] [US4] Backend unit test for Gallery CRUD operations in `msa3ed/Uis.Tests/Services/GalleryServiceTests.cs`
- [x] T022 [P] [US4] Frontend component test for `WorkGallery` rendering in `msa3ed/UIS/components/__tests__/WorkGallery.test.tsx`

### Implementation for User Story 4

- [x] T023 [US4] Implement `AddGalleryItemAsync` and `GetGalleryAsync` in `msa3ed/server/Services/GalleryService.cs`
- [x] T024 [P] [US4] Create `msa3ed/UIS/components/WorkGallery.tsx` grid component
- [x] T025 [US4] Integrate `WorkGallery` into executor profile screen `msa3ed/UIS/app/student/profile/[id].tsx`
- [x] T026 [P] [US4] Add "Chat Now" button to executor profiles in `msa3ed/UIS/app/student/profile/[id].tsx`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and system-wide improvements

- [x] T027 [P] Add sample gallery data to `msa3ed/server/Data/DbSeeder.cs`
- [x] T028 Run full `quickstart.md` validation scenarios
- [x] T029 Perform final type-check (`tsc`) and linting cleanup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundation (Phases 1-2)**: MUST be complete before US work begins.
- **US1 & US2**: Independent (MVP targets).
- **US3 & US4**: Depend on Foundation, but independent of each other.
- **Polish (Phase 7)**: Depends on all US completion.

### Parallel Opportunities

- US1 and US2 implementation can run in parallel using multiple agents.
- All test tasks marked [P] can run in parallel with each other.

---

## Implementation Strategy

### MVP First (US1 & US2)

1. Complete Setup and Foundation.
2. Implement US1 (Role Sidebar) and US2 (Admin Approvals).
3. **VALIDATE**: Ensure core workspace and safety controls are 100% functional.

### Incremental Delivery

1. Foundation + MVP → Professional Workspace Ready
2. US3 → Discovery Improved
3. US4 → Portfolio Presence Established

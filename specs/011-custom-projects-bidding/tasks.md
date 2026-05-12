# Tasks: Custom Projects & Advanced Search

**Input**: Design documents from `/specs/011-custom-projects-bidding/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The tasks below MUST include test tasks for both frontend and backend as per Constitution Principle III. Tests MUST be written FIRST and ensure they FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Install `@gorhom/bottom-sheet` and `react-native-gesture-handler` in `msa3ed/UIS/package.json`
- [x] T002 [P] Create `msa3ed/server/Services/ProjectService.cs` skeleton

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create EF Core migration for `ProjectRequest`, `ProjectOffer`, and `ProjectInvitation` tables in `msa3ed/server/Data/`
- [ ] T004 Update `ApplicationDbContext.cs` with new `DbSet` properties and configure entity relationships
- [ ] T005 Implement base `IProjectService` interface in `msa3ed/server/Services/ProjectService.cs`
- [ ] T006 Register `IProjectService` in `msa3ed/server/Program.cs`
- [ ] T007 Configure `react-native-gesture-handler` at the app root in `msa3ed/UIS/app/_layout.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Custom Project Requests (Priority: P1) 🎯 MVP

**Goal**: Students can post custom project requests and view them.

**Independent Test**: Login as Student -> Post a project -> View it in "My Projects" list.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T008 [P] [US1] Backend unit test for `CreateProjectRequestAsync` in `msa3ed/Uis.Tests/Services/ProjectServiceTests.cs`
- [ ] T009 [P] [US1] Frontend component test for `CreateProjectForm` in `msa3ed/UIS/components/__tests__/CreateProjectForm.test.tsx`

### Implementation for User Story 1

- [x] T010 [P] [US1] Implement `CreateProjectRequestAsync` and `GetStudentProjectsAsync` in `msa3ed/server/Services/ProjectService.cs`
- [x] T011 [US1] Create `ProjectsController.cs` and implement POST/GET endpoints for student projects
- [x] T012 [P] [US1] Create `CreateProjectForm` UI component in `msa3ed/UIS/components/CreateProjectForm.tsx`
- [x] T013 [US1] Implement "My Projects" screen for students in `msa3ed/UIS/app/student/projects/mine.tsx`
- [x] T014 [US1] Integrate `CreateProjectForm` into a new project posting screen in `msa3ed/UIS/app/student/projects/create.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Executor Bidding System (Priority: P1) 🎯 MVP

**Goal**: Executors can browse open projects and submit offers.

**Independent Test**: Login as Executor -> Browse projects -> Submit offer -> See offer in pending state.

### Tests for User Story 2 ⚠️

- [x] T015 [P] [US2] Backend unit test for `CreateProjectOfferAsync` in `msa3ed/Uis.Tests/Services/ProjectServiceTests.cs`

### Implementation for User Story 2

- [x] T016 [P] [US2] Implement `GetOpenProjectsAsync` and `CreateProjectOfferAsync` in `msa3ed/server/Services/ProjectService.cs`
- [x] T017 [US2] Add endpoints for fetching open projects and submitting offers in `msa3ed/server/Controllers/Api/ProjectsController.cs`
- [x] T018 [P] [US2] Create "Available Projects" screen for executors in `msa3ed/UIS/app/executor/projects/available.tsx`
- [x] T019 [US2] Create "Project Details & Bidding" screen in `msa3ed/UIS/app/executor/projects/[id].tsx`
- [x] T020 [US2] Link "Available Projects" to the executor sidebar in `msa3ed/UIS/app/student/_layout.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Offer Acceptance & Order Creation (Priority: P1)

**Goal**: Students can negotiate (chat) and accept offers, converting them into standard orders.

**Independent Test**: Student views offers -> Initiates Chat -> Accepts Offer -> Verifies Order is generated.

### Tests for User Story 3 ⚠️

- [x] T021 [P] [US3] Backend unit test for `AcceptProjectOfferAsync` (Order conversion) in `msa3ed/Uis.Tests/Services/ProjectServiceTests.cs`

### Implementation for User Story 3

- [x] T022 [US3] Update `Chat` and `Message` entities in `msa3ed/server/Models/AppModels.cs` to link to `ProjectOfferId`
- [x] T023 [US3] Implement `AcceptProjectOfferAsync` arbitration logic (Order creation) in `msa3ed/server/Services/ProjectService.cs`
- [x] T024 [US3] Add Acceptance endpoint in `msa3ed/server/Controllers/Api/ProjectsController.cs`
- [x] T025 [P] [US3] Implement "View Offers" UI for students in `msa3ed/UIS/app/student/projects/[id]/offers.tsx`
- [x] T026 [US3] Implement "Negotiate" chat initiation and "Accept Offer" actions in the UI

**Checkpoint**: All core bidding features should now be independently functional

---

## Phase 6: User Story 4 - Advanced Search Filters (Priority: P2)

**Goal**: Add multi-criteria filtering (Price, Rating, Time) via a Bottom Sheet to the search page.

**Independent Test**: Open search -> Open filter sheet -> Apply max price -> See results update instantly.

### Tests for User Story 4 ⚠️

- [x] T027 [P] [US4] Backend contract test for advanced filters in `msa3ed/Uis.Tests/Controllers/ExecutorsControllerTests.cs`
- [x] T028 [P] [US4] Frontend component test for `AdvancedFilterSheet` in `msa3ed/UIS/components/__tests__/AdvancedFilterSheet.test.tsx`

### Implementation for User Story 4

- [x] T029 [P] [US4] Update `CatalogService.cs` to handle `minPrice`, `maxPrice`, `minRating`, `maxDeliveryDays`
- [x] T030 [P] [US4] Update `ExecutorsController.cs` to handle `minRating` and `minCompletedOrders`
- [x] T031 [US4] Create `AdvancedFilterSheet` component using `@gorhom/bottom-sheet` in `msa3ed/UIS/components/AdvancedFilterSheet.tsx`
- [x] T032 [US4] Integrate `AdvancedFilterSheet` into `msa3ed/UIS/app/student/search.tsx` and connect to Redux store/API

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and system-wide improvements

- [x] T033 [P] Add sample ProjectRequests and ProjectOffers to `msa3ed/server/Data/DbSeeder.cs`
- [x] T034 Run full `quickstart.md` validation scenarios
- [x] T035 Perform final type-check (`tsc`) and linting cleanup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundation (Phases 1-2)**: MUST be complete before US work begins.
- **US1**: Foundation required.
- **US2**: Depends on US1 (needs existing projects to bid on).
- **US3**: Depends on US2 (needs existing offers to accept).
- **US4**: Independent of US1-3, depends only on Foundation.
- **Polish (Phase 7)**: Depends on all US completion.

### Parallel Opportunities

- Foundation tasks (T003-T007) can be parallelized after Setup.
- US1 UI (T012, T013) can run parallel to backend (T010, T011).
- US4 (Search Filters) can run entirely in parallel with US1-US3 once Foundation is complete.

---

## Implementation Strategy

### MVP First (US1, US2, US3)

1. Complete Setup and Foundation.
2. Implement US1 (Posting), US2 (Bidding), and US3 (Acceptance).
3. **VALIDATE**: Ensure the end-to-end flow from "Post Request" to "Order Created" works perfectly.

### Incremental Delivery

1. Foundation + US1 → Students can post needs.
2. US2 + US3 → Full reverse-marketplace enabled.
3. US4 → Search experience upgraded.

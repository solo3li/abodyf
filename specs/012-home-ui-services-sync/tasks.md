---
description: "Task list for Home UI Enhancement and Data Sync"
---

# Tasks: Home UI Enhancement and Data Sync

**Input**: Design documents from `/specs/012-home-ui-services-sync/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The tasks below include test tasks for both frontend and backend as per Constitution Principle III. Tests MUST be written FIRST and ensure they FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `msa3ed/UIS/`
- **Backend**: `msa3ed/server/`
- **Tests (BE)**: `msa3ed/Uis.Tests/`
- **Tests (FE)**: `msa3ed/UIS/store/slices/__tests__/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment verification

- [ ] T001 Verify API connectivity for services and executors endpoints using `curl`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T002 [P] Update `catalogSlice` initial state to include `executors: []` in `msa3ed/UIS/store/slices/catalogSlice.ts`
- [ ] T003 [P] Implement `fetchExecutors` async thunk in `msa3ed/UIS/store/slices/catalogSlice.ts`
- [ ] T004 Create backend integration test to verify `GET /api/Services` returns only 'Active' services in `msa3ed/Uis.Tests/ServicesTests.cs`
- [ ] T005 [P] Create backend integration test for `GET /api/Executors` in `msa3ed/Uis.Tests/ExecutorsTests.cs`

**Checkpoint**: Foundation ready - catalog slice can now hold both services and executors.

---

## Phase 3: User Story 1 - Professional Home UI & Data Visibility (Priority: P1) 🎯 MVP

**Goal**: Professional home screen displaying available services and top executors from the database.

**Independent Test**: Load the home screen and verify that services and executors from the database are correctly displayed with a professional design.

### Tests for User Story 1 ⚠️

- [ ] T006 [P] [US1] Create unit test for `catalogSlice` fulfilling `fetchExecutors` in `msa3ed/UIS/store/slices/__tests__/catalogSlice.test.ts`
- [ ] T007 [P] [US1] Create unit test for `FeaturedExecutors` component rendering in `msa3ed/UIS/components/__tests__/FeaturedExecutors.test.tsx`

### Implementation for User Story 1

- [ ] T008 [P] [US1] Create component `FeaturedExecutors.tsx` with professional styling and `boxShadow` in `msa3ed/UIS/components/FeaturedExecutors.tsx`
- [ ] T009 [US1] Update `HomeScreen` to dispatch `fetchExecutors` and `fetchServices` on mount in `msa3ed/UIS/app/student/(tabs)/index.tsx`
- [ ] T010 [US1] Replace placeholder executor list with `FeaturedExecutors` component in `msa3ed/UIS/app/student/(tabs)/index.tsx`
- [ ] T011 [US1] Apply `boxShadow` and grid spacing (16px/24px) to service cards in `msa3ed/UIS/app/student/(tabs)/index.tsx`
- [ ] T012 [US1] Implement header refinement (improved typography and gradients) in `msa3ed/UIS/app/student/(tabs)/index.tsx`

**Checkpoint**: User Story 1 is functional; home screen shows real data with professional styling.

---

## Phase 4: User Story 2 - Navigation to Service Details (Priority: P2)

**Goal**: Allow users to click on a service card and navigate to its full details.

**Independent Test**: Click a service card on home and verify it navigates to `/student/service/[id]`.

### Implementation for User Story 2

- [ ] T013 [P] [US2] Verify and fix navigation logic from home service cards to details screen in `msa3ed/UIS/app/student/(tabs)/index.tsx`

**Checkpoint**: User can successfully navigate from Home to Service Details.

---

## Phase 5: User Story 3 - Role-Based Home Experience (Priority: P3)

**Goal**: Personalize the home screen for executors to include their performance highlights.

**Independent Test**: Log in as an executor and verify the "Your Performance" widget is visible on Home.

### Implementation for User Story 3

- [ ] T014 [P] [US3] Implement role-check logic to show "Your Performance" widget for executors on Home in `msa3ed/UIS/app/student/(tabs)/index.tsx`

**Checkpoint**: Home screen adapts based on user role.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Skeletons, empty states, and final design touches.

- [ ] T015 [P] Implement `ServiceSkeleton` component for loading state in `msa3ed/UIS/components/skeletons/ServiceSkeleton.tsx`
- [ ] T016 [P] Integrate skeletons into `HomeScreen` loading state in `msa3ed/UIS/app/student/(tabs)/index.tsx`
- [ ] T017 [P] Add "Empty State" component for "No services found" in `msa3ed/UIS/components/EmptyState.tsx`
- [ ] T018 Run `npx expo export --platform web` to verify no build regressions.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1.
- **User Stories (Phase 3-5)**: Depends on Phase 2.
- **Polish (Phase 6)**: Depends on Phase 3 completion.

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2.
- **US2 (P2)**: Independent after Phase 2 (Verified in T013).
- **US3 (P3)**: Independent after Phase 2.

### Parallel Opportunities

- T002, T003, T004, T005 (Foundational) can run in parallel.
- T006, T007, T008 (US1 setup) can run in parallel.
- T015, T017 (Polish components) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2.
2. Complete Phase 3 (US1).
3. Validate Home screen renders services and executors correctly.

### Incremental Delivery

1. Foundation ready.
2. Home screen data sync (US1) -> MVP!
3. Add details navigation (US2).
4. Add executor-specific widgets (US3).
5. Add skeletons and empty states (Polish).

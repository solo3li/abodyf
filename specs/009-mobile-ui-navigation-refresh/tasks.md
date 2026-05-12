# Tasks: Mobile UI & Navigation Refresh

**Input**: Design documents from `/specs/009-mobile-ui-navigation-refresh/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The tasks below MUST include test tasks for both frontend and backend as per Constitution Principle III. Tests MUST be written FIRST and ensure they FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install `@react-navigation/drawer` and `react-native-reanimated` in `msa3ed/UIS/package.json`
- [x] T002 [P] Configure `react-native-reanimated` plugin in `msa3ed/UIS/babel.config.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Implement `searchTerm` filtering logic in `msa3ed/server/Services/CatalogService.cs`
- [x] T004 Update `GetServices` action to support `searchTerm` in `msa3ed/server/Controllers/Api/ApiControllers.cs`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Optimized Navigation (Priority: P1) 🎯 MVP

**Goal**: Streamline bottom bar to exactly 4 items (Home, Orders, Chat, Profile).

**Independent Test**: Verify that the bottom bar shows exactly 4 icons and they navigate correctly.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [P] [US1] Frontend unit test for `Tabs` layout rendering in `msa3ed/UIS/app/student/(tabs)/__tests__/_layout.test.tsx`

### Implementation for User Story 1

- [x] T006 [US1] Remove secondary tabs (Categories, Favourites, etc.) from `msa3ed/UIS/app/student/(tabs)/_layout.tsx`
- [x] T007 [US1] Update Tab icons and labels for Home, Orders, Chat, and Profile in `msa3ed/UIS/app/student/(tabs)/_layout.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Sidebar Navigation (Priority: P1) 🎯 MVP

**Goal**: Implement a Drawer navigator as the top-level parent of the Tabs navigator.

**Independent Test**: Swipe from the edge or tap menu icon to open sidebar; navigate to a secondary item.

### Tests for User Story 2 ⚠️

- [x] T008 [P] [US2] Frontend integration test for Drawer navigation in `msa3ed/UIS/app/__tests__/_layout.test.tsx`

### Implementation for User Story 2

- [x] T009 [US2] Create a new top-level `msa3ed/UIS/app/student/_layout.tsx` with `Drawer` navigator
- [x] T010 [US2] Configure `Drawer` to include the `(tabs)` group as the primary screen
- [x] T011 [US2] Add secondary screens (Categories, Favourites, Support) as entries in the `Drawer` layout
- [x] T012 [P] [US2] Create custom `SidebarContent` component in `msa3ed/UIS/components/SidebarContent.tsx`
- [x] T013 [US2] Add "Hamburger" menu icon to student screen headers in `msa3ed/UIS/app/student/(tabs)/_layout.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Home UI Refresh (Priority: P2)

**Goal**: Implement Search Bar and Vertical Category List on Home screen.

**Independent Test**: Search for a service and see filtered results; view categories in vertical layout.

### Tests for User Story 3 ⚠️

- [x] T014 [P] [US3] Backend contract test for `GET /api/Services?searchTerm=...` in `msa3ed/Uis.Tests/CatalogControllerTests.cs`
- [x] T015 [P] [US3] Frontend unit test for `SearchBar` component in `msa3ed/UIS/components/__tests__/SearchBar.test.tsx`

### Implementation for User Story 3

- [x] T016 [P] [US3] Create `SearchBar` component in `msa3ed/UIS/components/SearchBar.tsx`
- [x] T017 [US3] Implement search logic in `msa3ed/UIS/store/slices/catalogSlice.ts` to call API with `searchTerm`
- [x] T018 [US3] Redesign `msa3ed/UIS/app/student/(tabs)/index.tsx` to include `SearchBar` and vertical `CategoryList`
- [x] T019 [P] [US3] Implement `CategoryList` component with vertical layout in `msa3ed/UIS/components/CategoryList.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Sample Data Integration (Priority: P3)

**Goal**: Populate database with realistic sample data for testing.

**Independent Test**: Run seeder and verify realistic content appears in the app.

### Tests for User Story 4 ⚠️

- [x] T020 [P] [US4] Backend unit test for `SeedSampleDataAsync` logic in `msa3ed/Uis.Tests/Data/DbSeederTests.cs`

### Implementation for User Story 4

- [x] T021 [US4] Implement `SeedSampleDataAsync` method in `msa3ed/server/Data/DbSeeder.cs`
- [x] T022 [US4] Update `SeedAsync` in `msa3ed/server/Data/DbSeeder.cs` to invoke the new sample data seeder
- [x] T023 [P] [US4] Add `--seed-sample-data` flag support to `msa3ed/server/Program.cs` for manual triggering

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T024 [P] Update `msa3ed/UIS/constants/Colors.ts` with any new theme colors for the refresh
- [x] T025 Run `msa3ed/UIS/quickstart.md` validation on physical device or emulator
- [x] T026 Code cleanup and linting across `msa3ed/UIS` and `msa3ed/server`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS US3 and US4
- **User Stories (Phase 3-6)**: 
  - US1 and US2 are navigation-focused (Frontend only) and can start after Setup.
  - US3 depends on Foundational (Backend search logic).
  - US4 depends on Foundational (Backend seeder).
- **Polish (Phase 7)**: Depends on all user stories being complete.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- US1 (T005-T007) and US2 (T008-T013) can be worked on in parallel once Setup is done.
- US3 (T014-T019) and US4 (T020-T023) can run in parallel once Foundation is done.

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1 & 2.
2. Complete Phase 3 (US1) and Phase 4 (US2) to fix core navigation.
3. **STOP and VALIDATE**: Ensure Drawer + 4 Tabs work perfectly.

### Incremental Delivery

1. Foundation + US1/US2 → Navigation Ready
2. US3 → Discovery Improved
3. US4 → Platform Populated

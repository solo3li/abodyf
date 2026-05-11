# Tasks: User Profile & Favourites

**Input**: Design documents from `/specs/006-profile-and-favourites/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are requested in the implementation plan (xUnit for Backend, Jest for Frontend). Tasks include these tests to ensure data integrity and proper UI behavior.

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

- [ ] T003 Create `Favorite` join entity model in msa3ed/server/Models/AppModels.cs
- [ ] T004 Update `ApplicationDbContext` to include `DbSet<Favorite>` and configure many-to-many relationship in msa3ed/server/Data/ApplicationDbContext.cs
- [ ] T005 [P] Create and apply database migration for the new `Favorites` table in msa3ed/server/
- [ ] T006 [P] Initialize `FavoritesController` and register in routing in msa3ed/server/Controllers/Api/FavoritesController.cs
- [ ] T007 [P] Create `favoritesSlice.ts` for frontend state management in msa3ed/UIS/store/slices/favoritesSlice.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Bookmark Services (Priority: P1) 🎯 MVP

**Goal**: Allow Students to toggle favourite status on services.

**Independent Test**: Click heart icon on a service card and verify the database record is created/removed.

### Tests for User Story 1

- [ ] T008 [P] [US1] Create xUnit test for toggling favorites (Add/Remove) in msa3ed/server/Uis.Tests/FavoritesTests.cs

### Implementation for User Story 1

- [ ] T009 [US1] Implement `ToggleFavoriteAsync` service method in msa3ed/server/Services/DomainServices.cs
- [ ] T010 [US1] Implement `POST /api/Favorites/{serviceId}` endpoint in msa3ed/server/Controllers/Api/FavoritesController.cs
- [ ] T011 [US1] Add "Favorite" heart icon button to service cards and connect to Redux in msa3ed/UIS/app/student/(tabs)/index.tsx (or appropriate list view)

**Checkpoint**: User Story 1 (Bookmarking) should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Favourites List (Priority: P1)

**Goal**: Dedicated page to view and search through bookmarked services.

**Independent Test**: Navigate to Favourites tab, see list of saved services, and filter by keyword.

### Tests for User Story 2

- [ ] T012 [P] [US2] Create Jest test for Redux `favoritesSlice` search filtering logic in msa3ed/UIS/store/__tests__/favoritesSlice.test.ts

### Implementation for User Story 2

- [ ] T013 [US2] Implement `GET /api/Favorites` endpoint in msa3ed/server/Controllers/Api/FavoritesController.cs
- [ ] T014 [US2] Implement `fetchFavorites` async thunk in msa3ed/UIS/store/slices/favoritesSlice.ts
- [ ] T015 [US2] Create Favourites screen with search bar and service grid in msa3ed/UIS/app/student/(tabs)/favourites.tsx
- [ ] T016 [US2] Implement client-side filtering based on search keyword in msa3ed/UIS/app/student/(tabs)/favourites.tsx

**Checkpoint**: User Story 2 (Favourites List) should be fully functional and testable independently.

---

## Phase 5: User Story 3 - Edit Profile Information (Priority: P2)

**Goal**: Allow users to update their personal details (Name, Bio, Uni, Major).

**Independent Test**: Update Bio in the app, save, and verify the change persists on refresh.

### Tests for User Story 3

- [ ] T017 [P] [US3] Create xUnit test for profile update validation (character limits, mandatory fields) in msa3ed/server/Uis.Tests/UsersTests.cs

### Implementation for User Story 3

- [ ] T018 [US3] Implement `UpdateProfileAsync` in msa3ed/server/Services/DomainServices.cs with character limit validation
- [ ] T019 [US3] Implement `PUT /api/Users/Profile` endpoint in msa3ed/server/Controllers/Api/UsersController.cs
- [ ] T020 [US3] Create Edit Profile screen with form inputs and validation in msa3ed/UIS/app/student/profile/edit-profile.tsx

**Checkpoint**: User Story 3 (Edit Profile) should be fully functional and testable independently.

---

## Phase 6: User Story 4 - Update Profile Picture (Priority: P2)

**Goal**: Allow users to upload, crop, and delete their custom profile picture.

**Independent Test**: Upload a photo, see it cropped to square, and confirm it appears in the app headers.

### Implementation for User Story 4

- [ ] T021 [US4] Implement `POST /api/Users/ProfilePicture` for multipart upload in msa3ed/server/Controllers/Api/UsersController.cs
- [ ] T022 [US4] Implement `DELETE /api/Users/ProfilePicture` for resetting to default in msa3ed/server/Controllers/Api/UsersController.cs
- [ ] T023 [US4] Integrate `expo-image-picker` and `expo-image-manipulator` for square cropping in msa3ed/UIS/app/student/profile/edit-profile.tsx
- [ ] T024 [US4] Implement upload/delete logic and UI feedback in msa3ed/UIS/app/student/profile/edit-profile.tsx

**Checkpoint**: User Story 4 (Profile Picture) should be fully functional and testable independently.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T025 Update all UI profile icons/headers to use the dynamic `ProfilePicture` URL in msa3ed/UIS/app/student/(tabs)/profile.tsx
- [ ] T026 [P] Update API documentation in specs/006-profile-and-favourites/contracts/api.md
- [ ] T027 Run quickstart.md validation to confirm all scenarios pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup
- **User Stories (Phase 3+)**: All depend on Foundational
- **Polish (Final Phase)**: Depends on all user stories

### User Story Dependencies

- **User Story 1 (P1)**: Independent
- **User Story 2 (P2)**: Depends on US1 (requires bookmarked data to view)

### Parallel Opportunities

- T001, T002 (Setup)
- T005, T006, T007 (Foundational)
- T008 (US1 Tests), T012 (US2 Tests), T017 (US3 Tests)
- US3 and US4 implementation tasks can largely run in parallel

---

## Implementation Strategy

### MVP First (Favourites Only)

1. Complete Phase 1 & 2
2. Complete Phase 3 (Bookmarking)
3. Complete Phase 4 (List & Search)
4. **VALIDATE**: Ensure users can save and find services.

### Incremental Delivery

1. Add Profile Editing (US3)
2. Add Profile Picture (US4)
3. Final Polish

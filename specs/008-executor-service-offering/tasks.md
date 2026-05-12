# Tasks: Executor Service Offering

**Input**: Design documents from `/specs/008-executor-service-offering/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Register `IServiceService` in `msa3ed/server/Program.cs`
- [x] T002 [P] Create `msa3ed/server/Services/ServiceService.cs` placeholder class
- [x] T003 Create `msa3ed/UIS/store/slices/servicesSlice.ts` for Redux state management

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data models and DTOs that all user stories depend on

- [x] T004 Update `Service` entity and add `ServiceTag`, `ServiceOfferingTag` in `msa3ed/server/Models/AppModels.cs`
- [x] T005 [P] Add `ServiceDto`, `CreateServiceDto`, and `UpdateServiceDto` in `msa3ed/server/DTOs/AppDtos.cs`
- [x] T006 Create and apply EF Core migration `AddServiceOfferingFeatures` in `msa3ed/server/`
- [x] T007 [P] Define `IServiceService` interface methods in `msa3ed/server/Services/IServiceService.cs`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create and Publish Service (Priority: P1) 🎯 MVP

**Goal**: Enable Executors to create and submit new service offerings for approval.

**Independent Test**: Login as Executor -> Fill form -> Submit -> Verify service exists in `PendingApproval` status in database.

### Tests for User Story 1
- [x] T008 [P] [US1] Create unit tests for service validation logic in `msa3ed/Uis.Tests/Services/ServiceValidationTests.cs` (Included in implementation)
- [x] T009 [P] [US1] Integration test for service creation flow in `msa3ed/Uis.Tests/Services/ServiceCreationTests.cs` (Included in implementation)

### Implementation for User Story 1
- [x] T010 [US1] Implement `CreateServiceAsync` and `SubmitForReviewAsync` in `msa3ed/server/Services/ServiceService.cs`
- [x] T011 [US1] Implement `POST /api/Services` and `POST /api/Services/{id}/Submit` in `msa3ed/server/Controllers/Api/ServicesController.cs`
- [x] T012 [P] [US1] Create `ServiceForm.tsx` validation schema and component in `msa3ed/UIS/components/ServiceForm.tsx`
- [x] T013 [US1] Implement "Add Service" screen in `msa3ed/UIS/app/executor/services/create.tsx`
- [x] T014 [US1] Add "My Services" navigation to Executor profile in `msa3ed/UIS/app/executor/(tabs)/profile.tsx`

---

## Phase 4: User Story 2 - Manage Existing Services (Priority: P2)

**Goal**: Allow Executors to update, pause, or resume their services.

**Independent Test**: Pause an active service -> Verify it disappears from student catalog -> Resume -> Verify it reappears.

### Tests for User Story 2
- [x] T015 [P] [US2] Integration test for service state transitions (Active <-> Paused) in `msa3ed/Uis.Tests/Services/ServiceStateTests.cs` (Included in implementation)

### Implementation for User Story 2
- [x] T016 [US2] Implement `UpdateServiceAsync`, `PauseServiceAsync`, and `ResumeServiceAsync` in `msa3ed/server/Services/ServiceService.cs`
- [x] T017 [US2] Implement `GET /MyServices`, `PUT /{id}`, `POST /{id}/Pause`, and `POST /{id}/Resume` in `msa3ed/server/Controllers/Api/ServicesController.cs`
- [x] T018 [US2] Create services management list screen in `msa3ed/UIS/app/executor/services/index.tsx`
- [x] T019 [P] [US2] Implement "Edit Service" flow in `msa3ed/UIS/app/executor/services/[id].tsx`

---

## Phase 5: User Story 3 - Service Image Management (Priority: P2)

**Goal**: Support high-quality image uploads for service offerings.

**Independent Test**: Upload a JPG via form -> Verify image renders on service detail page in mobile app.

### Implementation for User Story 3
- [x] T020 [US3] Integrate `IFileService` into `ServicesController` for handling multi-part image uploads in `msa3ed/server/Controllers/Api/ServicesController.cs`
- [x] T021 [P] [US3] Implement image picker and preview logic using `expo-image-picker` in `msa3ed/UIS/components/ServiceForm.tsx`
- [x] T022 [US3] Update `ServiceCard` and `ServiceDetails` components to render `ImageUrl` in `msa3ed/UIS/app/shared/service/`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Admin workflows, search enhancements, and final validation.

- [x] T023 [US1] Implement Admin review dashboard (List Pending, Approve, Reject) in `msa3ed/server/Controllers/AdminController.cs`
- [x] T024 [US1] Create Admin approval view in `msa3ed/server/Views/Admin/PendingServices.cshtml`
- [x] T025 [P] Implement tag-based filtering in `msa3ed/server/Services/CatalogService.cs`
- [x] T026 [P] Add success/error toast notifications for service actions in `msa3ed/UIS/store/slices/servicesSlice.ts`
- [x] T027 Run final validation using `specs/008-executor-service-offering/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all User Stories.
- **User Stories (Phase 3-5)**: All depend on Phase 2. Can proceed in parallel after Foundation.
- **Polish (Phase 6)**: Depends on User Story 1 (Admin approval flow) and User Story 2 (Filtering).

### Parallel Opportunities
- Backend and Frontend tasks within the same phase (e.g., T011 and T012) can be worked on in parallel once DTOs (T005) are defined.
- Phase 4 and Phase 5 can be implemented in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 & 2.
2. Complete Phase 3 (US1) to enable service creation and submission.
3. Complete Admin approval tasks (T023, T024) to make services live.

### Incremental Delivery
- **Increment 1**: Service creation + Admin approval (Marketplace populated).
- **Increment 2**: Service management (Executor control).
- **Increment 3**: Image handling + Tag filtering (Professional discovery).

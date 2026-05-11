# Tasks: Remove OTP Verification

**Input**: Design documents from `/specs/005-remove-otp-verification/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are requested in the implementation plan (xUnit for Backend, Jest for Frontend). Tasks include these tests to ensure the new simplified flow is verified.

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

- [ ] T001 [P] Verify backend build and tests in msa3ed/server/
- [ ] T002 [P] Verify frontend build and tests in msa3ed/UIS/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Clear the `EmailOtps` table to perform the hard reset of verification data in msa3ed/server/Data/DbSeeder.cs or via a direct migration
- [ ] T004 [P] Update `IAuthService` and `AuthService` interfaces to support returning user data on login/register in msa3ed/server/Services/CoreServices.cs
- [ ] T005 [P] Update `IOtpService` and `OtpService` to support immediate success or "Not Required" status in msa3ed/server/Services/CoreServices.cs

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Direct Login (Priority: P1) 🎯 MVP

**Goal**: Allow Students and Executors to log in with email/password and gain immediate access without OTP.

**Independent Test**: Enter valid credentials on the login screen and verify immediate redirection to the home screen.

### Tests for User Story 1

- [ ] T006 [P] [US1] Create xUnit test for direct login response (token + user) in msa3ed/server/Uis.Tests/AuthControllerTests.cs
- [ ] T007 [P] [US1] Create Jest test for Redux `login` action fulfilling with token and user in msa3ed/UIS/store/__tests__/authSlice.test.ts

### Implementation for User Story 1

- [ ] T008 [US1] Modify `AuthController.Login` to return `token` and `user` object immediately in msa3ed/server/Controllers/Api/ApiControllers.cs
- [ ] T009 [US1] Update `authSlice.ts` to store `user` data upon `login.fulfilled` in msa3ed/UIS/store/slices/authSlice.ts
- [ ] T010 [US1] Update `login.tsx` to navigate directly to `(tabs)` upon successful login in msa3ed/UIS/app/(auth)/login.tsx
- [ ] T011 [US1] Implement redirection for users in "pending verification" state with info message in msa3ed/UIS/app/(auth)/login.tsx
- [ ] T012 [US1] Modify `AuthController.VerifyOtp` to return success immediately for backward compatibility in msa3ed/server/Controllers/Api/ApiControllers.cs

**Checkpoint**: User Story 1 (Login) should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Direct Registration (Priority: P2)

**Goal**: Ensure new user accounts are active immediately and logged in upon registration.

**Independent Test**: Complete the registration form and verify immediate login and redirection to home.

### Tests for User Story 2

- [ ] T013 [P] [US2] Create xUnit test for registration returning token and user details in msa3ed/server/Uis.Tests/AuthControllerTests.cs
- [ ] T014 [P] [US2] Create Jest test for Redux `register` action fulfilling with token and user in msa3ed/UIS/store/__tests__/authSlice.test.ts

### Implementation for User Story 2

- [ ] T015 [US2] Update `AuthService.RegisterAsync` to ensure `IsActive = true` and return the user object in msa3ed/server/Services/CoreServices.cs
- [ ] T016 [US2] Modify `AuthController.Register` to generate a token and return `token` + `user` in msa3ed/server/Controllers/Api/ApiControllers.cs
- [ ] T017 [US2] Update `authSlice.ts` to handle user data on `register.fulfilled` in msa3ed/UIS/store/slices/authSlice.ts
- [ ] T018 [US2] Update `register.tsx` to navigate directly to `(tabs)` upon successful registration in msa3ed/UIS/app/(auth)/register.tsx

**Checkpoint**: User Story 2 (Registration) should be fully functional and testable independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T019 [P] Update API documentation in specs/005-remove-otp-verification/contracts/auth.md
- [ ] T020 [P] Cleanup unused `OtpService` methods or calls related to primary auth in msa3ed/server/Services/CoreServices.cs
- [ ] T021 [P] Remove `otp-verify.tsx` screen if no longer reachable in msa3ed/UIS/app/(auth)/otp-verify.tsx
- [ ] T022 Run quickstart.md validation to confirm all scenarios pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2). Depends on US1 logic for token generation and Redux storage patterns.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- Foundational tasks T004 and T005 can run in parallel.
- Tests (T006, T007) can run in parallel with each other.
- Registration tests (T013, T014) can run in parallel.
- Polish tasks T019, T020, T021 can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Login)
4. **VALIDATE**: Ensure existing users can log in without OTP.

### Incremental Delivery

1. Deploy User Story 1 (Login) -> Immediate value for existing users.
2. Add User Story 2 (Registration) -> Immediate value for new users.
3. Final Polish and cleanup.

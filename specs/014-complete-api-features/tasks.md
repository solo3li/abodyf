# Tasks: complete-api-features

**Feature Plan**: [plan.md](plan.md) | **Feature Spec**: [spec.md](spec.md)

## Implementation Strategy
Implementation follows a priority-ordered approach based on user stories. Phase 1 & 2 handle schema and shared services. Phases 3-6 deliver independent slices of value (Withdrawals, Reviews, Disputes, Admin).

## Dependencies
- US1, US2, US3, US4 are largely independent functional slices.
- Setup & Foundational must be completed before any User Story.
- Admin dashboard (US4) depends on data populated by US1, US2, and US3.

---

## Phase 1: Setup

- [x] T001 Create EF Core migration for new entities (WithdrawalRequest, Review, Dispute) in `msa3ed/server/Data/`
- [x] T002 Seed `MinWithdrawalAmount` setting in `msa3ed/server/Data/ApplicationDbContext.cs`

## Phase 2: Foundational

- [x] T003 [P] Implement `IWithdrawalService` and `IReviewService` interfaces in `msa3ed/server/Services/`
- [x] T004 [P] Implement `IDisputeService` and `IAdminService` interfaces in `msa3ed/server/Services/`

## Phase 3: [US1] Executor Financial Payouts (Priority: P1)
**Goal**: Allow executors to withdraw earnings via manual screenshot verification.
**Independent Test**: Request a withdrawal with a sample screenshot; Admin approves; wallet balance decreases.

- [x] T005 [US1] Update `AppModels.cs` with `WithdrawalRequest` entity in `msa3ed/server/Models/AppModels.cs`
- [x] T006 [US1] Create unit tests for withdrawal logic in `msa3ed/Uis.Tests/WithdrawalTests.cs`
- [x] T007 [US1] Implement `WithdrawalService.RequestWithdrawalAsync` with screenshot upload in `msa3ed/server/Services/WalletService.cs`
- [x] T008 [US1] Implement Admin approval/rejection logic in `msa3ed/server/Services/WalletService.cs`
- [x] T009 [US1] Create `WalletController` endpoints for withdrawals in `msa3ed/server/Controllers/Api/WalletController.cs`

## Phase 4: [US2] User Feedback & Reputation (Priority: P1)
**Goal**: Allow students to rate/review executors and executors to reply.
**Independent Test**: Student submits a 5-star review; Executor's average rating updates immediately; Executor posts a reply.

- [x] T010 [US2] Update `AppModels.cs` with `Review` entity and denormalized fields in `msa3ed/server/Models/AppModels.cs`
- [x] T011 [US2] Create unit tests for rating aggregation in `msa3ed/Uis.Tests/ReviewTests.cs`
- [x] T012 [US2] Implement `ReviewService.AddReviewAsync` with average rating updates in `msa3ed/server/Services/ReviewService.cs`
- [x] T013 [US2] Implement executor reply logic in `msa3ed/server/Services/ReviewService.cs`
- [x] T014 [US2] Create `ReviewsController` endpoints in `msa3ed/server/Controllers/Api/ReviewsController.cs`

## Phase 5: [US3] Conflict Resolution (Priority: P2)
**Goal**: Protect Escrow funds via a mandatory-evidence dispute flow.
**Independent Test**: Student opens dispute; Escrow release is blocked; Admin Resolves (Refund/Release).

- [x] T015 [US3] Update `AppModels.cs` with `Dispute` entity and `Order` status in `msa3ed/server/Models/AppModels.cs`
- [x] T016 [US3] Create unit tests for dispute state transitions in `msa3ed/Uis.Tests/DisputeTests.cs`
- [x] T017 [US3] Implement `DisputeService.OpenDisputeAsync` with mandatory evidence in `msa3ed/server/Services/DisputeService.cs`
- [x] T018 [US3] Implement Admin resolution (Refund/Release) in `msa3ed/server/Services/DisputeService.cs`
- [x] T019 [US3] Update `OrdersController` with dispute endpoints in `msa3ed/server/Controllers/Api/ApiControllers.cs`

## Phase 6: [US4] Administrative Oversight (Priority: P3)
**Goal**: Provide Admin with platform KPIs and settings management.
**Independent Test**: Admin views dashboard stats; updates commission rate; verifies change in next order settlement.

- [x] T020 [US4] Implement optimized SQL/LINQ queries for platform stats in `msa3ed/server/Services/AdminService.cs`
- [x] T021 [US4] Implement dynamic settings update (Commission, MinWithdrawal) in `msa3ed/server/Services/AdminService.cs`
- [x] T022 [US4] Create `AdminController` for dashboard and settings in `msa3ed/server/Controllers/Api/AdminController.cs`

## Phase 7: Polish & Cross-Cutting

- [x] T023 Perform final audit of all new endpoints for structured logging in `msa3ed/server/Controllers/Api/`
- [x] T024 Verify RTL support for review comments and dispute descriptions in database persistence

# Tasks: backend-full-verification

**Feature Plan**: [plan.md](plan.md) | **Feature Spec**: [spec.md](spec.md)

## Implementation Strategy
Verification will follow a prioritized approach, starting with the core infrastructure (logging, rate limiting, and OTP removal) followed by user journey audits. MVP scope includes full verification of Phase 1 (Auth) and Phase 2 (Service/Ordering).

## Dependencies
- US1 -> US2 (Ordering depends on authenticated users)
- US2 -> US4 (Settlement depends on active orders)
- Setup & Foundational -> All User Stories

## Parallel Execution
- T008 (User tests) and T014 (SignalR tests) can run in parallel.
- T019 (Load test script) can be developed alongside user story audits.

---

## Phase 1: Setup

- [x] T001 Configure Serilog for structured JSON logging in `msa3ed/server/Program.cs`
- [x] T002 Implement IP-based rate limiting middleware in `msa3ed/server/Middleware/RateLimitingMiddleware.cs`
- [x] T003 [P] Register rate limiting middleware and logging in `msa3ed/server/Program.cs`

## Phase 2: Foundational

- [x] T004 Audit `IAuthService` and remove OTP requirements in `msa3ed/server/Services/CoreServices.cs`
- [x] T005 Update `AuthController` to skip OTP verification steps in `msa3ed/server/Controllers/Api/ApiControllers.cs`
- [x] T006 Ensure `AuditLogService` is registered and functional in `msa3ed/server/Services/AuditLogService.cs`

## Phase 3: [US1] Secure Identity & Profile Management (Priority: P1)
**Goal**: Verify users can register and manage profiles without OTP friction.
**Independent Test**: Register a user and update their bio; verify 200 OK and database persistence without receiving an email.

- [x] T007 [US1] Create integration tests for Register/Login without OTP in `msa3ed/Uis.Tests/AuthTests.cs`
- [x] T008 [P] [US1] Create contract tests for Profile update in `msa3ed/Uis.Tests/UserTests.cs`
- [x] T009 [US1] Verify profile picture upload and delete endpoints in `msa3ed/server/Controllers/Api/ApiControllers.cs`

## Phase 4: [US2] Seamless Service Discovery & Ordering (Priority: P1)
**Goal**: Verify students can find services and trigger the Escrow flow.
**Independent Test**: Search for a service, create an order, and verify `WalletTransaction` for "OrderPayment" exists.

- [x] T010 [US2] Audit `ServicesController` for correct filtering and search in `msa3ed/server/Controllers/Api/ApiControllers.cs`
- [x] T011 [US2] Implement integration test for Order creation with Escrow hold in `msa3ed/Uis.Tests/OrderTests.cs`
- [x] T012 [US2] Verify insufficient balance handling in `msa3ed/server/Controllers/Api/ApiControllers.cs`

## Phase 5: [US3] Real-time Collaboration & Custom Offers (Priority: P1)
**Goal**: Verify real-time messaging stability and offer negotiation.
**Independent Test**: Connect to `PrivateChatHub` as two users and exchange a message and a custom offer.

- [x] T013 [US3] Audit `ChatHub` and `PrivateChatHub` for stability in `msa3ed/server/Hubs/`
- [x] T014 [P] [US3] Create SignalR connection stability test in `msa3ed/Uis.Tests/SignalRTests.cs`
- [x] T015 [US3] Verify custom offer acceptance flow in `msa3ed/server/Controllers/Api/ApiControllers.cs`

## Phase 6: [US4] Order Lifecycle & Financial Settlement (Priority: P2)
**Goal**: Verify successful work delivery and fund release.
**Independent Test**: Mark an order as "Completed" and verify `Escrow` status is "Released" and executor balance increased.

- [x] T016 [US4] Implement integration test for Order completion and Escrow release in `msa3ed/Uis.Tests/OrderLifecycleTests.cs`
- [x] T017 [US4] Verify Wallet transaction atomicity during fund release in `msa3ed/server/Services/WalletService.cs`

## Phase 7: [US5] Platform Support & Conflict Resolution (Priority: P3)
**Goal**: Verify users can get support.
**Independent Test**: Create a ticket and verify it appears in `TicketController.GetMyTickets`.

- [x] T018 [US5] Verify ticket creation and messaging flow in `msa3ed/server/Controllers/Api/ApiControllers.cs`

## Phase 8: Polish & Performance

- [x] T019 Create k6 load testing script in `scripts/load_test.js`
- [x] T020 Run k6 load test and verify performance targets for 1,000 concurrent users
- [x] T021 [P] Perform final audit of all 55+ endpoints for RESTful status codes and structured logging

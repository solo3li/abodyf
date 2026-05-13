# Feature Specification: Full Project Execution and Verification

**Feature Branch**: `009-verification-testing`  
**Created**: 2026-05-13  
**Status**: Draft  
**Input**: User description: "run project + test all bacend endpoints + test logic all features"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Full Stack Local Execution (Priority: P1)

As a developer, I want to run both the ASP.NET Core backend and the Expo mobile app concurrently so that I can verify the end-to-end integration of the system.

**Why this priority**: Essential for verifying that the implemented features actually work in a real-world environment.

**Independent Test**: Successfully starting the server and seeing the mobile app home screen with data from the database.

**Acceptance Scenarios**:

1. **Given** the database is seeded, **When** I run the backend server, **Then** it should listen on the configured port and the Swagger UI should be accessible.
2. **Given** the backend is running, **When** I start the Expo app, **Then** it should successfully authenticate and load service data.

---

### User Story 2 - Comprehensive API Validation (Priority: P1)

As a QA engineer, I want to test all backend endpoints (Auth, Users, Services, Orders, Admin, Wallet) to ensure they conform to the expected response schemas and logic.

**Why this priority**: Ensures API reliability and security across all modules.

**Independent Test**: Running a test suite or manual verification of every endpoint in the `ApiControllers.cs` and `AdminController.cs`.

**Acceptance Scenarios**:

1. **Given** an admin token, **When** I GET `/api/Admin/Wallets`, **Then** I should receive a list of all user wallets with balance data.
2. **Given** a student token, **When** I POST `/api/Orders`, **Then** the wallet balance should be deducted and an escrow record created.

---

### User Story 3 - Business Logic Verification (Priority: P2)

As a product owner, I want to verify the logic for escrow release, commission calculations, and wallet limits to ensure the platform's financial integrity.

**Why this priority**: Critical for the platform's business model and financial accuracy.

**Independent Test**: Executing a full order lifecycle (Create -> Accept -> Complete) and checking the final wallet balances of Student, Executor, and Platform Commission account.

**Acceptance Scenarios**:

1. **Given** an order for 100 EGP and a 10% commission, **When** the order is completed, **Then** the Executor should receive 90 EGP and the Platform should receive 10 EGP.
2. **Given** a manual credit adjustment of 50 EGP by an Admin, **When** the audit log is checked, **Then** there should be a corresponding record with the correct details.

---

### Edge Cases

- **Connectivity**: What happens when the mobile app cannot reach the backend? (Appropriate error messages should be shown).
- **Insufficient Funds**: How does the system handle an order creation if the student's wallet balance is below the order price? (Should return a 400 error with "Insufficient balance").
- **Double Completion**: What happens if an executor tries to mark an order as "Complete" twice? (Should prevent duplicate escrow release).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow running the backend using `dotnet run` and the frontend using `npm start`.
- **FR-002**: Backend MUST provide a comprehensive set of API endpoints for all implemented features (Wallet, Settings, Audit, KYC, Orders).
- **FR-003**: System MUST verify that all financial operations (Credit/Debit/Transfer) are recorded in the transaction history and audit logs.
- **FR-004**: System MUST allow testing of the escrow release logic through the API.
- **FR-005**: All Admin endpoints MUST be protected by role-based authorization.

### Key Entities *(include if feature involves data)*

- **Admin/QA**: The actor performing the verification.
- **Test Environment**: The local development setup including the SQL database and API server.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the newly implemented backend endpoints in `AdminController` and `ApiControllers` return a 200 OK or 201 Created status when valid data is provided.
- **SC-002**: The end-to-end flow from Service Search -> Order Creation -> Escrow Hold -> Order Completion -> Escrow Release is verified to take less than 5 seconds (excluding manual intervention).
- **SC-003**: 100% of administrative balance adjustments are accurately reflected in the `AuditLog` table.
- **SC-004**: The system correctly handles the 10% commission rate as defined in the global settings.

## Assumptions

- **Local Setup**: It is assumed that the developer has `dotnet` and `node/npm` installed locally.
- **Database**: A local or accessible SQL Server instance is available and seeded with initial roles and settings.
- **Mobile Environment**: The mobile app is tested using an emulator or a physical device connected to the same network as the backend.
- **Manual Verification**: While automated tests are ideal, manual verification via Postman/Swagger and the mobile UI is acceptable for this phase.

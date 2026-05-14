# Feature Specification: backend-full-verification

**Feature Branch**: `011-backend-full-verification`  
**Created**: 2026-05-14  
**Status**: Draft  
**Input**: User description: "test all features in backend and all endpoint and fix all problems"

## Clarifications

### Session 2026-05-14
- Q: What are the target concurrency and data volume assumptions? → A: 1,000 concurrent users / 10,000 daily orders
- Q: How should external dependencies (OTP/Mail) be handled? → A: OTP requirement removed; no mail verification needed
- Q: Is rate limiting required for critical endpoints? → A: Yes, implement standard rate limiting (100 req/min per IP)
- Q: What is the data retention policy? → A: No specific policy; persist all data indefinitely
- Q: What level of observability/logging is required? → A: Implement structured JSON logging for all I/O boundaries

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Identity & Profile Management (Priority: P1)

Users (Students/Executors) need a reliable way to manage their identity and personal information to maintain trust on the platform.

**Why this priority**: Essential for any interaction on the platform. Without secure auth and verified profiles, the marketplace cannot function.

**Independent Test**: Can be tested by running the Auth and Users controller suites to verify registration, login, and profile updates.

**Acceptance Scenarios**:

1. **Given** a new student, **When** they register with a valid email, **Then** they should be able to log in immediately without OTP verification.
2. **Given** a logged-in user, **When** they update their bio or profile picture, **Then** the changes should persist and be reflected in the `/api/Users/Me` endpoint.

---

### User Story 2 - Seamless Service Discovery & Ordering (Priority: P1)

Students need to find specific university services quickly and pay for them securely.

**Why this priority**: Core business value. The primary purpose of the platform is matching service needs with providers.

**Independent Test**: Can be tested by searching for services, filtering by price/category, and creating an order with sufficient wallet balance.

**Acceptance Scenarios**:

1. **Given** several active services, **When** a student searches for a keyword, **Then** only relevant services should be returned.
2. **Given** a service, **When** a student creates an order, **Then** funds should be moved to escrow and the order status should become "Pending".

---

### User Story 3 - Real-time Collaboration & Custom Offers (Priority: P1)

Students and executors need to discuss requirements and negotiate prices in real-time.

**Why this priority**: Complex services often require clarification. Real-time chat reduces friction and increases conversion.

**Independent Test**: Can be tested by opening two chat sessions (via SignalR) and exchanging messages and custom offers.

**Acceptance Scenarios**:

1. **Given** an active order, **When** the student sends a message, **Then** the executor should receive it instantly via SignalR.
2. **Given** a private chat, **When** the executor sends a custom offer, **Then** the student should be able to accept it, triggering a new order creation.

---

### User Story 4 - Order Lifecycle & Financial Settlement (Priority: P2)

Executors need to deliver work and get paid reliably once the student is satisfied.

**Why this priority**: Critical for executor retention and financial integrity.

**Independent Test**: Can be tested by moving an order from "InProgress" to "Completed" and verifying fund release from escrow to the executor's wallet.

**Acceptance Scenarios**:

1. **Given** an "InProgress" order, **When** the executor marks it as complete, **Then** the escrow should release funds to the executor.
2. **Given** a completed order, **When** the executor checks their earnings, **Then** the new transaction should appear in their wallet history.

---

### User Story 5 - Platform Support & Conflict Resolution (Priority: P3)

Users need a way to report issues or get help from administrators.

**Why this priority**: Necessary for long-term platform health and handling edge cases.

**Independent Test**: Can be tested by creating a support ticket and checking its status.

**Acceptance Scenarios**:

1. **Given** a platform issue, **When** a user submits a ticket via `/api/Ticket`, **Then** the ticket should be visible in their "My Tickets" list.

---

### Edge Cases

- **Insufficient Balance**: What happens when a student tries to create an order with less money than the service price? (System must return 400 Bad Request with "Insufficient funds").
- **Concurrency**: How does the system handle two executors trying to accept the same "Pending" order at the same time? (One succeeds, the other receives a 400 "Order is not available").
- **Network Interruptions**: How does SignalR handle temporary disconnects during a chat session? (Must support automatic reconnection and state recovery).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Auth system MUST support JWT-based authentication; OTP verification is removed or globally bypassed.
- **FR-002**: Services MUST be searchable by title/description and filterable by category, min/max price, and rating.
- **FR-003**: The system MUST implement an Escrow mechanism where funds are held during order execution and released upon completion.
- **FR-004**: Chat MUST support real-time delivery via SignalR, including text, file attachments (up to 20MB), and structured custom offers.
- **FR-005**: Wallet system MUST maintain an atomic audit trail of all transactions (TopUp, Payment, EscrowHold, EscrowRelease).
- **FR-006**: All API endpoints MUST follow RESTful conventions and return appropriate HTTP status codes (200, 201, 204, 400, 401, 403, 404, 500).
- **FR-007**: System MUST implement rate limiting (100 req/min per IP) to protect against automated abuse.
- **FR-008**: System MUST persist all transaction, chat, and user data indefinitely without a specific deletion policy.
- **FR-009**: System MUST implement structured JSON logging for all I/O boundaries (API, DB, External Services) to facilitate debugging.

### Key Entities *(include if feature involves data)*

- **User**: Represents Students and Executors. Attributes: FullName, Email, WalletBalance, ProfilePicture, University.
- **Service**: Offerings provided by executors or the platform. Attributes: Title, Description, BasePrice, Category.
- **Order**: A contract between Student and Executor. Attributes: Price, Status (Pending, InProgress, Completed, etc.).
- **Chat**: A conversation channel tied to an order or a private interaction.
- **WalletTransaction**: Record of any financial movement. Attributes: Amount, Type (In/Out), Description.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of defined API endpoints (approx. 55) pass automated integration tests for both success and failure paths.
- **SC-002**: API response time (p95) for data retrieval (Services/Me/Orders) is under 500ms.
- **SC-003**: Real-time message delivery latency via SignalR is under 200ms in a stable network environment.
- **SC-004**: Zero "orphaned" funds in the wallet system (sum of all balances + escrow matches total system inputs).
- **SC-005**: Resolution of all specific errors identified in `specs/010-fix-api-errors/plan.md`.
- **SC-006**: System maintains performance targets under a load of 1,000 concurrent users.

## Assumptions

- **Target Users**: Users are university students and executors with basic digital literacy.
- **Scope Boundaries**: This feature covers the entire backend API; frontend UI verification is secondary but will be used to validate end-to-end flows.
- **Environment**: Backend runs on .NET 10 with a PostgreSQL database.
- **Data/Environment**: Existing database schema will be extended if necessary, but data integrity must be preserved.

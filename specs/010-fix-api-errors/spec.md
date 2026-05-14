# Feature Specification: fix-api-signalr-errors

**Feature Branch**: `010-fix-api-signalr-errors`  
**Created**: 2026-05-13  
**Status**: Draft  
**Input**: User description: "fix POST http://209.38.238.175:5035/api/Orders/a4a002dc-19b0-4a77-933b-5a941d24d875/Accept 404 (Not Found) GET http://209.38.238.175:5035/api/Chat/Inbox 500 (Internal Server Error) GET http://209.38.238.175:5035/api/Wallet 404 (Not Found) POST http://209.38.238.175:5035/hubs/chat/negotiate?negotiateVersion=1 net::ERR_FAILED"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Viewing Personal Wallet (Priority: P1)

As a registered user, I want to see my current wallet balance and transaction history so that I can track my funds.

**Why this priority**: Core financial transparency is critical for user trust in a marketplace platform.

**Independent Test**: Can be tested by navigating to the wallet screen in the app and observing the balance and transaction list.

**Acceptance Scenarios**:

1. **Given** I am logged in with a valid token, **When** I request `/api/Wallet`, **Then** the system returns a 200 OK status with balance and transaction data.
2. **Given** I am not logged in or have an invalid token, **When** I request `/api/Wallet`, **Then** the system returns a 401 Unauthorized status.

---

### User Story 2 - Real-time Communication (Priority: P2)

As a user, I want to be able to connect to the real-time chat service so that I can communicate instantly with other users.

**Why this priority**: Essential for active collaboration between students and executors.

**Independent Test**: Successfully establishing a SignalR connection from the mobile app or browser.

**Acceptance Scenarios**:

1. **Given** the server is running on a public IP, **When** a client initiates a SignalR connection to `/hubs/chat`, **Then** the negotiation succeeds (200 OK) and the connection is established.

---

### User Story 3 - Accepting Available Orders (Priority: P2)

As an executor, I want to accept available orders so that I can start working on them.

**Why this priority**: Core workflow for executors to earn money.

**Independent Test**: Successfully transitioning an order from "Pending" to "InProgress" via the Accept endpoint.

**Acceptance Scenarios**:

1. **Given** an order exists with status "Pending", **When** an executor sends a POST request to `/api/Orders/{id}/Accept`, **Then** the system returns 200 OK and updates the order status.

---

### User Story 4 - Viewing Inbox (Priority: P3)

As a user, I want to view my list of conversations (Inbox) so that I can manage my communications.

**Why this priority**: Basic navigation requirement for messaging.

**Independent Test**: Retrieving a list of private chats without system errors.

**Acceptance Scenarios**:

1. **Given** I have previous conversations, **When** I request `/api/Chat/Inbox`, **Then** the system returns 200 OK with a sorted list of chats.

### Edge Cases

- **Empty Inbox**: System should return an empty list with 200 OK, not a 500 error.
- **Expired/Invalid IDs**: System should return 404 with a descriptive error message indicating the entity (Order/User) was not found.
- **SignalR CORS**: System must allow credentials and specific origins even when accessed via IP or Tunnel URL.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST return 200 OK for `/api/Wallet` if the user exists in the database.
- **FR-002**: System MUST return a descriptive 404 message (e.g., "User not found") for `/api/Wallet` if the ID in the token is valid but the record is missing.
- **FR-003**: System MUST resolve the 500 Internal Server Error in `/api/Chat/Inbox` by using SQL-translatable sorting logic.
- **FR-004**: System MUST allow SignalR negotiation requests from all valid client origins.
- **FR-005**: System MUST ensure the `/api/Orders/{id}/Accept` endpoint is reachable and returns 404 only when the specific order ID does not exist.

### Key Entities *(include if feature involves data)*

- **User**: Represents the account holder, including their wallet balance.
- **Order**: Represents a service request being processed.
- **Chat/Message**: Represents communication threads between users.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid requests to `/api/Wallet` return 200 OK.
- **SC-002**: SignalR connection attempts from mobile clients succeed on the first attempt 100% of the time.
- **SC-003**: `/api/Chat/Inbox` response time is under 500ms for users with up to 50 conversations.

## Assumptions

- **Authentication**: JWT authentication is correctly configured and tokens contain a valid `sub` or `NameIdentifier` claim.
- **Environment**: The server is deployed on a Linux VPS (IP 209.38.238.175) and handles incoming traffic on port 5035.
- **Database**: PostgreSQL is running and accessible to the application.
- **SignalR**: The client uses the standard SignalR JS/TS library or a compatible mobile client.

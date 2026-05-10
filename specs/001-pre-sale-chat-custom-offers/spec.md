# Feature Specification: Pre-sale Chat and Custom Offers

**Feature Branch**: `001-pre-sale-chat-custom-offers`  
**Created**: May 10, 2026  
**Status**: Draft  
**Input**: User description: "add add ability to communcat and chate with excuter berfor buy service + add ability excuter send custome ofers for customer in private chate live fiver"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pre-sale Communication (Priority: P1)

A student browsing services wants to ask a specific question to the executor before committing to a purchase. They should be able to initiate a direct chat from the service details page.

**Why this priority**: Fundamental to reducing friction and increasing trust before a transaction.

**Independent Test**: A student can navigate to a service, click "Contact Executor", and send a message. The executor receives the message and can reply.

**Acceptance Scenarios**:

1. **Given** a student is on a Service Details page, **When** they click the "Contact" button, **Then** they are redirected to a private chat with that executor.
2. **Given** a student sends a pre-sale message, **When** the executor logs in, **Then** they see the message in their "Conversations" list.

---

### User Story 2 - Creating a Custom Offer (Priority: P1)

During a private chat, an executor realizes the student's needs are slightly different from their standard service listing. The executor should be able to send a tailored offer with a specific price and delivery timeframe.

**Why this priority**: Critical for flexibility in service delivery, similar to industry leaders like Fiverr.

**Independent Test**: An executor can click "Create Custom Offer" in a private chat, fill in details, and send it. The student sees a formatted offer card in the chat.

**Acceptance Scenarios**:

1. **Given** an executor is in a private chat with a student, **When** they submit a custom offer with price and delivery time, **Then** the offer is displayed as a structured message in the chat for both parties.
2. **Given** a custom offer has been sent, **When** the executor views it, **Then** they see its status as "Pending".

---

### User Story 3 - Accepting a Custom Offer (Priority: P1)

A student receives a custom offer that fits their needs perfectly. They should be able to accept it directly from the chat and proceed to payment, which automatically creates an order.

**Why this priority**: Completes the transaction loop for custom services.

**Independent Test**: A student can click "Accept Offer" on an offer card, which takes them to the checkout process with the custom price.

**Acceptance Scenarios**:

1. **Given** a student has received a custom offer, **When** they click "Accept", **Then** an order is created with the offer's price and terms, and they are taken to the payment screen.
2. **Given** a student accepts an offer, **When** the order is successfully created, **Then** the offer status in chat changes to "Accepted".

---

### Edge Cases

- **Multiple Offers**: What happens if an executor sends multiple offers? (Latest one should be prominent, but all valid until accepted/expired).
- **Service Deletion**: When an executor attempts to delete a service, the system MUST warn them if there are active custom offers linked to it. If they proceed with deletion, the existing offers remain valid for the recipient to accept until they expire or are manually withdrawn.
- **Expired Offers**: How long does a student have to accept an offer before it becomes invalid? (Default: 7 days).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Contact Executor" action on the Service Details screen that opens a `PrivateChat`.
- **FR-002**: System MUST allow Executors to create "Custom Offers" within a `PrivateChat`.
- **FR-003**: Custom Offers MUST include: Description, Price, Delivery Time (in days).
- **FR-004**: System MUST notify Students via in-app alert when a new Custom Offer is received.
- **FR-005**: Students MUST be able to "Accept" or "Decline" a Custom Offer directly from the chat interface.
- **FR-006**: Accepting a Custom Offer MUST trigger the standard `Order` creation and `Payment` workflow using the offer's specific parameters.
- **FR-007**: System MUST track the status of a Custom Offer: `Pending`, `Accepted`, `Declined`, `Withdrawn`, or `Expired`.
- **FR-008**: Executors MUST be able to "Withdraw" a pending offer before it is accepted.
- **FR-009**: The system MUST support hybrid offer linkage: offers can optionally be linked to a specific `Service` from the catalog or sent as independent "General" task offers.

### Key Entities *(include if feature involves data)*

- **CustomOffer**: Represents a tailored proposal.
    - `Id`: Unique identifier.
    - `ExecutorId`: Reference to the creator.
    - `StudentId`: Reference to the recipient.
    - `ServiceId` (Optional): Reference to a base service.
    - `Description`: Details of the custom work.
    - `Price`: The agreed amount.
    - `DeliveryDays`: Estimated time to complete.
    - `Status`: Current state of the offer.
    - `CreatedAt`: Timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of students who initiate a pre-sale chat receive a response from the executor within 24 hours.
- **SC-002**: Users can create and send a custom offer in under 45 seconds.
- **SC-003**: 100% of accepted custom offers correctly generate a corresponding order with the exact price and delivery terms of the offer.
- **SC-004**: Increased conversion rate from pre-sale chats to orders (Target: +15%).

## Assumptions

- Pre-sale chats will leverage the existing `PrivateChat` infrastructure and `ChatHub` for real-time delivery.
- The `Payment` and `Escrow` systems can handle dynamic prices not tied to the base `Service` model.
- Users have push notifications enabled or regularly check the app to see new messages/offers.
- Authentication and basic user profiles are already functional.

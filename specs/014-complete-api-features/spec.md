# Feature Specification: complete-api-features

**Feature Branch**: `014-complete-api-features`  
**Created**: 2026-05-14  
**Status**: Draft  
**Input**: User description: "what shoud endpoints to complet all features in msa3ed/UIS"

## Clarifications

### Session 2026-05-14
- **Q**: Which payment providers or methods should be supported for payouts? → **A**: Manual verification via screenshot (Admin accepts in panel).
- **Q**: What are the final possible outcomes when an Admin resolves a disputed order? → **A**: Full Refund to Student OR Full Release to Executor.
- **Q**: Should Service Providers (Executors) be allowed to post a public response to a student's review? → **A**: Yes, one public response per review.
- **Q**: Is there a minimum balance required to request a withdrawal? → **A**: Configurable setting managed by the Admin in the panel.
- **Q**: Should Students be required to upload evidence when opening a dispute? → **A**: Yes, mandatory screenshot + description.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Executor Financial Payouts (Priority: P1)

As an Executor who has completed services, I want to withdraw my earnings to my bank or wallet so that I can realize the value of my work.

**Why this priority**: Without a withdrawal system, the marketplace is a "closed loop" where money can't leave the platform, which is a blocker for adoption by providers.

**Independent Test**: An executor with a positive balance requests a withdrawal by uploading a screenshot of their wallet/bank details; an admin approves it; the executor's balance decreases by the requested amount.

**Acceptance Scenarios**:

1. **Given** an executor has 500 EGP in their wallet, **When** they request a withdrawal of 400 EGP with a screenshot, **Then** a "Pending" withdrawal request is created.
2. **Given** a pending withdrawal request, **When** an admin approves it in the admin panel, **Then** the wallet balance becomes 100 EGP and the request status becomes "Completed".

---

### User Story 2 - User Feedback & Reputation (Priority: P1)

As a Student, I want to rate and review executors after order completion so that other students can find reliable providers.

**Why this priority**: Reputation is the trust anchor of a marketplace. Without reviews, students cannot distinguish between good and bad service providers.

**Independent Test**: A student completes an order, submits a 5-star rating, and verifies the executor's average rating updates accordingly.

**Acceptance Scenarios**:

1. **Given** a completed order, **When** the student submits a 5-star rating and comment, **Then** the service's "Rating" and "ReviewsCount" are updated.
2. **Given** a service with reviews, **When** a user views the service details, **Then** they see the list of recent comments and the average score.
3. **Given** a review exists, **When** the executor posts a response, **Then** both the review and the response are visible to all users.

---

### User Story 3 - Conflict Resolution (Priority: P2)

As a Student, I want to dispute an order if the work is unsatisfactory or undelivered so that my funds in escrow can be protected.

**Why this priority**: Essential for platform safety. Escrow must have a mechanism for intervention.

**Independent Test**: A student disputes a "Pending" order by providing a screenshot and description; the order status changes to "Disputed"; the Escrow release is blocked until admin resolution.

**Acceptance Scenarios**:

1. **Given** an order is in progress, **When** the student clicks "Open Dispute" and provides evidence, **Then** the order status becomes "Disputed".
2. **Given** a disputed order, **When** an admin resolves it in favor of the student (Full Refund), **Then** the Escrow is returned to the student's wallet.
3. **Given** a disputed order, **When** an admin resolves it in favor of the executor (Full Release), **Then** the Escrow is paid out to the executor (minus commission).

---

### User Story 4 - Administrative Oversight (Priority: P3)

As an Admin, I want to see platform-wide statistics and manage commission rates so that I can optimize platform growth.

**Why this priority**: Required for business operations and sustainability.

**Independent Test**: Admin visits the dashboard and sees total volume, active users, and can update the platform commission percentage.

**Acceptance Scenarios**:

1. **Given** I am an admin, **When** I access the stats endpoint, **Then** I receive total orders count, total revenue, and total pending payouts.
2. **Given** I change the commission rate to 15%, **When** a new order is completed, **Then** the settlement uses the 15% rate.

---

### Edge Cases

- **Double Withdrawal**: System MUST block subsequent withdrawal requests if the user's available balance is already committed to a pending request.
- **Disputed Completion**: Completion MUST be blocked until an active dispute is resolved by an Admin.
- **Minimum Withdrawal**: System MUST reject withdrawal requests below the `MinWithdrawalAmount` setting.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow Executors to create withdrawal requests by uploading a mandatory screenshot of their payout details.
- **FR-002**: System MUST allow Admins to approve or reject pending withdrawal requests.
- **FR-003**: System MUST allow Students to submit a numeric rating (1-5) and text review for completed orders.
- **FR-004**: System MUST recalculate and persist average ratings for both Services and Users (Executors).
- **FR-005**: System MUST allow Students to initiate a dispute by providing mandatory evidence (screenshot + description).
- **FR-006**: System MUST provide an Admin-only dashboard endpoint for platform KPIs.
- **FR-007**: System MUST allow Admin to update global settings: `CommissionRate` and `MinWithdrawalAmount`.
- **FR-008**: System MUST allow Executors to provide exactly one public response to any review received.

### Key Entities *(include if feature involves data)*

- **WithdrawalRequest**: Attributes: UserId, Amount, ScreenshotUrl, Status, CreatedAt.
- **Review**: Attributes: OrderId, ServiceId, FromUserId, Rating, Comment, ResponseContent, RespondedAt.
- **Dispute**: Attributes: OrderId, EvidenceUrl, Description, Status, ResolutionType (Refund/Release), AdminNotes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Executors can submit a withdrawal request with image upload in under 45 seconds.
- **SC-002**: Average ratings update within 5 seconds of review submission across all service views.
- **SC-003**: Disputes block all escrow settlement actions until Admin resolves the state.
- **SC-004**: Admin dashboard aggregates 10,000+ orders in under 500ms using optimized queries.

## Assumptions

- **Manual Verification**: No automated bank/wallet APIs are used; admins perform transfers manually based on screenshots.
- **KYC Requirement**: Withdrawal requests require a previously "Approved" KYC status.
- **RTL Support**: All review comments and dispute reasons support Arabic text (RTL).

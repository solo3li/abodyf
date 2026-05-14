# Feature Specification: UIS Full Integration & Page Creation

**Feature Branch**: `015-uis-full-integration`  
**Created**: 2026-05-14  
**Status**: Draft  
**Input**: User description: "full integration uis to adapt with backend + ceate nessary pages"

## Clarifications

### Session 2026-05-14
- Q: Does the system trigger the actual bank/wallet transfer for withdrawals? → A: Record-keeping only (manual transfer + proof upload).
- Q: What are the possible statuses for a Dispute? → A: Open, UnderReview, Resolved-Refunded, Resolved-Released, Rejected.
- Q: When should reviews become visible? → A: Immediate Visibility (public as soon as submitted).
- Q: Is a user restricted to only one "Pending" withdrawal request? → A: Single (only one "Pending" request allowed at a time).
- Q: How should users be informed of a deposit rejection? → A: Internal Notification (SignalR alert + Admin notes).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Financial Management (Priority: P1)

As an executor, I want to manage my earnings by requesting withdrawals, and as a student, I want to top up my balance via manual deposit screenshots.

**Why this priority**: Core financial functionality is critical for the marketplace to function.
**Independent Test**: Can be tested by submitting a deposit request as a student and a withdrawal request as an executor, and verifying both appear in the admin panel.

**Acceptance Scenarios**:

1. **Given** a student is on the wallet page, **When** they upload a screenshot for a 500 EGP deposit, **Then** a "Pending" deposit request is created in the database.
2. **Given** an admin is in the dashboard, **When** they approve a deposit request, **Then** the student's wallet balance increases immediately.
3. **Given** an executor has a balance of 1000 EGP, **When** they request a 500 EGP withdrawal, **Then** their balance remains 1000 EGP but a "Pending" request is logged for admin review.

---

### User Story 2 - Quality Assurance (Priority: P2)

As a student, I want to leave a rating and review for an executor after my order is completed so other students can see their performance.

**Why this priority**: Builds trust and maintains quality in the marketplace.
**Independent Test**: Can be tested by completing an order and ensuring the "Leave Review" button appears and functions.

**Acceptance Scenarios**:

1. **Given** an order status is "Completed", **When** the student navigates to order details, **Then** they see a review form (1-5 stars + comment).
2. **Given** a review is submitted, **When** anyone views the executor's profile, **Then** the new review and updated average rating are visible immediately.

---

### User Story 3 - Conflict Resolution (Priority: P3)

As a user, I want to open a dispute for an order if I am unhappy with the service, so an admin can arbitrate.

**Why this priority**: Essential for handling edge cases and protecting users.
**Independent Test**: Can be tested by opening a dispute from an active order and verifying it appears in the admin "Disputes" list.

**Acceptance Scenarios**:

1. **Given** an order is "In Progress" or "Delivered", **When** a student clicks "Open Dispute" and provides evidence, **Then** the order status changes to "Disputed".
2. **Given** an order is "Disputed", **When** an admin resolves it in favor of the student, **Then** the funds are refunded to the student's wallet.

---

### Edge Cases

- **Insufficient Balance**: System handles withdrawal requests larger than the current balance by showing an error.
- **Concurrent Withdrawals**: System prevents submitting a new withdrawal request if one is already in "Pending" status.
- **Duplicate Reviews**: System prevents a student from leaving multiple reviews for the same order.
- **Admin Session Timeout**: System ensures admin actions (approving deposits) require a valid active session.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an "Admin Deposits" page to list, filter, and resolve (Approve/Reject) manual deposit requests.
- **FR-002**: System MUST provide an "Admin Withdrawals" page to record manual payouts and store screenshot proof of transfer.
- **FR-003**: System MUST provide a "User Wallet" interface for both students and executors to view balance and transaction history.
- **FR-004**: System MUST allow students to upload images as proof of payment for manual top-ups.
- **FR-005**: System MUST allow students to submit 1-5 star ratings and text comments for completed orders.
- **FR-006**: System MUST update executor stats (Average Rating, Review Count) automatically when a new review is saved.
- **FR-007**: System MUST provide a "Disputes" dashboard for admins to view evidence and resolve conflicts.
- **FR-008**: System MUST notify users in real-time via SignalR when their deposit or withdrawal request status changes.

### Key Entities

- **DepositRequest**: Represents a user's request to add funds. Attributes: UserId, Amount, ScreenshotUrl, Status, CreatedAt.
- **WithdrawalRequest**: Represents an executor's request to cash out. Attributes: ExecutorId, Amount, Status, AdminNotes.
- **Review**: Represents user feedback. Attributes: OrderId, FromUserId, ToUserId, Rating, Comment.
- **Dispute**: Represents a conflict. Attributes: OrderId, OpenedByUserId, Description, Status (Open, UnderReview, Resolved-Refunded, Resolved-Released, Rejected), EvidenceUrl.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can resolve a deposit request in under 30 seconds via the dashboard.
- **SC-002**: User wallet balances are updated in real-time (within 1 second) upon deposit approval.
- **SC-003**: Executor average rating is recalculated and reflected on their profile instantly after a review is submitted.
- **SC-004**: System successfully handles concurrent deposit requests from 50 users without data inconsistency.

## Assumptions

- **Existing Auth**: The existing student/admin authentication system (Cookie/JWT) will be used for all new pages.
- **Backend Availability**: All necessary API endpoints (e.g., `/api/Wallet/Deposits`, `/api/Reviews`) are already implemented or will be implemented as part of this integration.
- **Admin Layout**: New admin pages will use the existing `_AdminLayout.cshtml` which includes Tailwind and Bootstrap.
- **File Storage**: Screenshots will be stored in the existing local `wwwroot/uploads` directory.

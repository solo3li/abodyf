# Business Logic Documentation: UIS

This document details the core business rules and workflows governing the University Interface System (UIS).

## 1. Authentication & User Management

### 1.1 Registration Flow
- **Default Role:** Every new user is automatically assigned the `Student` role.
- **Data Persistence:** User details (Name, Email, PasswordHash, University, Major) are stored in the `Users` table.
- **Validation:** Email uniqueness is enforced at the database and service levels.

### 1.2 Login & OTP Verification
- **Two-Step Authentication:**
    1.  **Credentials:** User provides Email and Password. System validates against the database.
    2.  **JWT Issuance:** A temporary JWT token is generated.
    3.  **OTP Generation:** A 4-digit random code is generated, stored with a 10-minute expiry, and sent via email.
- **Verification:**
    - The user must provide the 4-digit code.
    - System validates code against the email, ensuring it hasn't expired and hasn't been used.
    - Upon success, the full user profile and persistent session roles are returned.

### 1.3 Password Reset
- **Forgot Password:** Triggers a new OTP sent to the user's email.
- **Reset:** Requires a valid, unused OTP and the new password. The system updates the `PasswordHash` upon verification.

## 2. Executor Verification (KYC)

### 2.1 Submission
- **Requirements:** Users must provide their National ID number, Phone number, and clear photos of the National ID (Front and Back).
- **Status:** Initial submission status is always `Pending`.

### 2.2 Administrative Review
- **Approval Logic:**
    - Admin reviews documents via the dashboard.
    - Upon approval:
        1. Status changes to `Approved`.
        2. User's `IsExecutor` flag is set to `true`.
        3. The `Executor` role is added to the user's role collection.
        4. A success notification is sent via email and in-app alert.
- **Rejection Logic:**
    - Admin provides a `RejectionReason`.
    - Status changes to `Rejected`.
    - User is notified and can re-submit after correcting issues.

## 3. Order & Escrow Lifecycle

### 3.1 Order Creation
- **Trigger:** A student selects a service and initiates a request.
- **Pricing:** Price is determined by the service's `BasePrice` or custom negotiation (if applicable).
- **Initial State:** Status is `Pending` (or `AwaitingPayment` if immediate checkout is required).

### 3.2 Payment & Escrow
- **Payment Processing:** Once a payment is confirmed (via simulation or gateway):
    1. A `Payment` record is created with `Completed` status.
    2. An `Escrow` record is created, holding the funds.
    3. Order status moves to `Pending` (available for executors to accept).
- **Available Orders:** Only executors can see and accept orders in the `Pending` state.

### 3.3 Execution & Delivery
- **Acceptance:** An executor accepts the order, linking their `ExecutorId` to the order.
- **Communication:** A dedicated `Chat` session is automatically linked or created for the order.
- **Delivery:** Work is delivered via the chat system using multi-format attachments.

### 3.4 Dispute Resolution & Settlement
- **Release of Funds:**
    - Funds are released from `Escrow` to the Executor's balance upon:
        1. Student confirmation of delivery.
        2. Administrative resolution of a dispute.
- **Refund Logic:**
    - If a dispute is resolved in favor of the student, `Escrow` status moves to `Refunded`, and the order is marked as `Cancelled`.

## 4. Communication & Notifications

### 4.1 Real-Time Chat
- **Attachments:** Supports images, documents, and voice notes.
- **Persistence:** All messages are saved in the `Messages` table.
- **Broadcast:** SignalR groups (based on `ChatId`) ensure instant delivery to the recipient.

### 4.2 Support Tickets
- **Mechanism:** Similar to chat but specifically for Student/Executor interaction with Admin.
- **Dispute Linkage:** Tickets can be optionally linked to an `OrderId` to facilitate mediation.

### 4.3 Notification Engine
- **Multi-Channel:** Every critical event (KYC update, new message, order status change) triggers:
    1. An in-app `Notification` entry.
    2. A templated HTML email (via MailKit/SMTP).

## 5. Financial Rules
- **Earnings Tracking:** Executors can view their completed transactions and total balance via the `/api/Payments/Earnings` endpoint.
- **Escrow Integrity:** Funds cannot be released without an explicit status change in the `Escrow` record, preventing double-spending or unauthorized withdrawals.

# Data Model: complete-api-features

## New Entities

### WithdrawalRequest
Represents a request by an executor to cash out their wallet balance.
- `Id`: Guid (PK)
- `ExecutorId`: Guid (FK to User)
- `Amount`: decimal
- `ScreenshotUrl`: string (Proof of bank/wallet details or transfer)
- `Status`: enum (Pending, Approved, Rejected, Cancelled)
- `AdminNotes`: string (Optional)
- `CreatedAt`: DateTime
- `ProcessedAt`: DateTime?

### Review
User feedback for a completed service.
- `Id`: Guid (PK)
- `OrderId`: Guid (FK to Order)
- `ServiceId`: Guid (FK to Service)
- `FromUserId`: Guid (FK to User - Student)
- `ToUserId`: Guid (FK to User - Executor)
- `Rating`: int (1-5)
- `Comment`: string (Unicode/Arabic)
- `ResponseContent`: string (Executor's reply)
- `RespondedAt`: DateTime?
- `CreatedAt`: DateTime

### Dispute
A conflict flag on an order.
- `Id`: Guid (PK)
- `OrderId`: Guid (FK to Order)
- `OpenedByUserId`: Guid (FK to User)
- `EvidenceUrl`: string (Screenshot of issue)
- `Description`: string (Arabic support)
- `Status`: enum (Open, Resolved)
- `ResolutionType`: enum (None, RefundToStudent, ReleaseToExecutor)
- `AdminNotes`: string
- `CreatedAt`: DateTime
- `ResolvedAt`: DateTime?

## Updated Entities

### User
- `Rating`: decimal (denormalized average)
- `ReviewsCount`: int

### Service
- `Rating`: decimal (denormalized average)
- `ReviewsCount`: int

### Order
- `Status`: Add `Disputed` state.

## State Transitions

### Withdrawal Flow
`Requested (Pending)` -> `Approved` | `Rejected`

### Dispute Flow
`InProgress` -> `Disputed` -> `Completed` (via Admin Release) | `Refunded` (via Admin Refund)

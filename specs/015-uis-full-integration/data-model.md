# Data Model: uis-full-integration

## Entities

### DepositRequest
Represents a student's manual fund top-up via screenshot verification.
- `Id`: Guid (PK)
- `UserId`: Guid (FK to User)
- `Amount`: Decimal
- `ScreenshotUrl`: String (Proof of payment)
- `Status`: String (Pending, Approved, Rejected, Cancelled)
- `AdminNotes`: String (Rejection reason or notes)
- `CreatedAt`: DateTime
- `ProcessedAt`: DateTime (Nullable)

### WithdrawalRequest
Represents an executor's request to cash out their earnings.
- `Id`: Guid (PK)
- `ExecutorId`: Guid (FK to User)
- `Amount`: Decimal
- `Status`: String (Pending, Approved, Rejected, Cancelled)
- `AdminNotes`: String (Proof of transfer or notes)
- `CreatedAt`: DateTime
- `ProcessedAt`: DateTime (Nullable)

### Review
Represents feedback from a student to an executor after order completion.
- `Id`: Guid (PK)
- `OrderId`: Guid (FK to Order)
- `ServiceId`: Guid (FK to Service)
- `FromUserId`: Guid (FK to User)
- `ToUserId`: Guid (FK to User)
- `Rating`: Integer (1-5)
- `Comment`: String
- `ResponseContent`: String (Executor's response)
- `CreatedAt`: DateTime

### Dispute
Represents a formal conflict opened by a user regarding an order.
- `Id`: Guid (PK)
- `OrderId`: Guid (FK to Order)
- `OpenedByUserId`: Guid (FK to User)
- `Description`: String
- `EvidenceUrl`: String
- `Status`: String (Open, UnderReview, Resolved-Refunded, Resolved-Released, Rejected)
- `ResolutionType`: String (RefundToStudent, ReleaseToExecutor, None)
- `AdminNotes`: String
- `CreatedAt`: DateTime
- `ResolvedAt`: DateTime (Nullable)

## Relationships
- `User` 1 → N `DepositRequest`
- `User` 1 → N `WithdrawalRequest`
- `Order` 1 → 1 `Review`
- `Order` 1 → 1 `Dispute`

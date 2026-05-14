# Data Model: backend-full-verification

## Core Entities

### User
- **Fields**: Id (Guid), FullName, Email, PasswordHash, WalletBalance (decimal), Rating (decimal), CompletedOrdersCount (int), IsAdmin, IsExecutor, IsStaff, IsActive.
- **Relationships**: Many-to-Many with `Role`, One-to-Many with `Order` (as Student/Executor), `Favorite`, `WalletTransaction`.

### Service
- **Fields**: Id (Guid), Title, Description, BasePrice (decimal), CategoryId (Guid), IsActive, ImageUrl, Rating, ReviewsCount, DeliveryTime.
- **Relationships**: Belongs to `Category`, Belongs to `User` (Executor).

### Order
- **Fields**: Id (Guid), StudentId (Guid), ExecutorId (Guid?), ServiceId (Guid), Price (decimal), Status (AwaitingPayment, Pending, InProgress, Completed, etc.), CreatedAt.
- **Relationships**: Belongs to `User` (Student/Executor), Belongs to `Service`, One-to-One with `Escrow`, One-to-Many with `Payment`, One-to-One with `Chat`.

### Chat
- **Fields**: Id (Guid), Type (OrderChat, PrivateChat, TicketChat), OrderId (Guid?), StudentId (Guid?), ExecutorId (Guid?).
- **Relationships**: One-to-Many with `Message`.

### WalletTransaction
- **Fields**: Id (Guid), UserId (Guid), Amount (decimal), Type (TopUp, OrderPayment, EscrowRelease, etc.), Description, RelatedOrderId (Guid?).
- **Relationships**: Belongs to `User`.

### AuditLog
- **Fields**: Id (Guid), AdminId (Guid), Action, TargetEntityType, TargetEntityId, Details (JSON), CreatedAt.
- **Relationships**: Belongs to `User` (Admin).

## State Transitions: Order
1. **AwaitingPayment**: Initial state upon creation.
2. **Pending**: After payment is secured in Escrow.
3. **InProgress**: After an Executor accepts the order.
4. **Completed**: After work is delivered and Escrow is released.
5. **Refunded**: If the order is cancelled and funds returned to student.

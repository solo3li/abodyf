# Data Model: Platform Polish, Wallet & Full Admin Control

**Feature**: 008-platform-polish-wallet-admin
**Date**: 2026-05-13

## 1. Entity Modifications

### User (Modification)
Adds internal wallet capability.
- `WalletBalance` (decimal) - Default: `0.00m`

### SystemSetting (Modification)
Expanded seed data.
- New keys: `CommissionRate` (default: 0.10), `MaxWalletTopUp` (default: 10000), `PlatformName` (default: "UIS")

---

## 2. New Entities

### WalletTransaction
Append-only ledger for all wallet balance changes.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `Id` | Guid | Primary Key | |
| `UserId` | Guid | Foreign Key | Owner of the wallet |
| `User` | User | Navigation | |
| `Amount` | decimal | | Positive for credit, negative for debit |
| `Type` | string | | `TopUp`, `OrderPayment`, `EscrowRelease`, `AdminCredit`, `AdminDebit`, `Refund` |
| `Description` | string | | Human-readable reason |
| `RelatedOrderId` | Guid? | Foreign Key (Null) | Link to order if applicable |
| `Order` | Order? | Navigation | |
| `CreatedAt` | DateTime | | Default `DateTime.UtcNow` |

### AuditLog
Immutable record of all admin actions for security and tracking.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `Id` | Guid | Primary Key | |
| `AdminId` | Guid | Foreign Key | The admin who performed the action |
| `Admin` | User | Navigation | |
| `Action` | string | | E.g., `UpdateRole`, `ApproveKyc`, `CreditWallet` |
| `TargetEntityType` | string | | E.g., `User`, `Order`, `Service` |
| `TargetEntityId` | string | | String representation of target ID |
| `Details` | string | | JSON blob with old/new values |
| `CreatedAt` | DateTime | | Default `DateTime.UtcNow` |

---

## 3. State Transitions

### Wallet Operations
All state transitions below MUST run inside an EF Core transaction.

**Top-Up (Student)**
1. Ensure amount > 0 and <= MaxWalletTopUp.
2. `User.WalletBalance += amount`.
3. Create `WalletTransaction` (Type: "TopUp", Amount: +amount).

**Order Creation (Student)**
1. Ensure `User.WalletBalance >= Order.Price`.
2. `User.WalletBalance -= Order.Price`.
3. Create `WalletTransaction` (Type: "OrderPayment", Amount: -Order.Price).
4. Order status -> "Pending". Escrow created -> "Held".

**Escrow Release (Admin/System)**
1. Order completes. Escrow status -> "Released".
2. `Executor.WalletBalance += Escrow.Amount`.
3. Create `WalletTransaction` (Type: "EscrowRelease", Amount: +Escrow.Amount).

**Refund (Admin)**
1. Order cancelled. Escrow status -> "Refunded".
2. `Student.WalletBalance += Escrow.Amount`.
3. Create `WalletTransaction` (Type: "Refund", Amount: +Escrow.Amount).

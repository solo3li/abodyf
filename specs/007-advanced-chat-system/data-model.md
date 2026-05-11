# Data Model: Advanced Chat System

## Entities

### Chat (Updated)
- **Status**: Updated
- **Fields**:
  - `Type`: Enum (`OrderChat`, `PrivateChat`, `TicketChat`) - defaults to `OrderChat` for legacy data.
  - `OrderId` (Existing, Nullable for PrivateChat/TicketChat)
  - `StudentId` (Existing)
  - `ExecutorId` (Existing)
- **Migration**: Existing chats with `OrderId != null` will be marked as `OrderChat`.

### Message (Updated)
- **Status**: Updated
- **Fields**:
  - `AttachmentUrl` (Existing) - will now hold paths to audio/documents as well.
  - `AttachmentType` (Existing) - update to explicitly handle `Image`, `Document`, `Audio`.
  - `CustomOfferId`: Guid (Nullable FK to CustomOffer).

### CustomOffer (New)
- **Status**: New
- **Fields**:
  - `Id`: Guid (PK)
  - `Title`: String
  - `Description`: String
  - `Price`: Decimal
  - `DeliveryDays`: Int
  - `Status`: String (`Pending`, `Accepted`, `Rejected`, `Expired`)
  - `ExecutorId`: Guid (FK to Users)
  - `StudentId`: Guid (FK to Users)
  - `CreatedAt`: DateTime
- **Relationships**:
  - One-to-One or One-to-Many with `Message` (a message embeds the offer).

### TicketMessage (Updated)
- **Status**: Updated
- **Fields**:
  - Add `AttachmentUrl`: String (Nullable)
  - Add `AttachmentType`: String (Nullable)
  - Add `AudioUrl`: String (Nullable) or use `AttachmentUrl` if unified.

## State Transitions

### Custom Offer Lifecycle
- `Pending` -> Student clicks Accept -> `Accepted` (redirects to payment/order creation)
- `Pending` -> Student rejects / ignores for X days -> `Rejected` / `Expired`

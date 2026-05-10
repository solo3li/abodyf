# Data Model: Pre-sale Chat and Custom Offers

## Entities

### CustomOffer
Represents a formal proposal sent by an executor to a student within a chat.

| Field | Type | Description |
|-------|------|-------------|
| `Id` | `Guid` | Primary Key |
| `ChatId` | `Guid` | Foreign Key to `Chat` |
| `ExecutorId` | `Guid` | Foreign Key to `User` (The sender) |
| `StudentId` | `Guid` | Foreign Key to `User` (The recipient) |
| `ServiceId` | `Guid?` | Optional Foreign Key to `Service` |
| `Description` | `string` | Details of the work to be performed |
| `Price` | `decimal` | The total price offered |
| `DeliveryDays`| `int` | Time to delivery in days |
| `Status` | `string` | `Pending`, `Accepted`, `Declined`, `Withdrawn`, `Expired` |
| `CreatedAt` | `DateTime` | Timestamp of creation |
| `AcceptedAt` | `DateTime?`| Timestamp when student accepted |

### Message (Updated)
Extending existing `Message` entity.

| Field | Type | Description |
|-------|------|-------------|
| `CustomOfferId` | `Guid?` | Optional link to a `CustomOffer` |

## State Transitions (CustomOffer)

1. `Pending` -> `Accepted`: Student clicks "Accept" -> Order created.
2. `Pending` -> `Declined`: Student clicks "Decline".
3. `Pending` -> `Withdrawn`: Executor clicks "Withdraw".
4. `Pending` -> `Expired`: 7 days pass without action.

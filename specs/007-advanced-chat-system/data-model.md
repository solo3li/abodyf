# Data Model: Advanced Chat System

## Entities

### Message (Updated)
Extends the existing `Message` entity to support rich media and multiple attachments.

| Field | Type | Description |
|-------|------|-------------|
| Id | Guid | Primary Key |
| ChatId | Guid | Reference to Chat |
| SenderId | Guid | Reference to User |
| Content | String | Text message content (optional if attachments present) |
| WaveformData | int[] | Array of sample peaks (50-100 values) for audio visualization |
| CustomOfferId | Guid? | Optional reference to a Custom Offer |
| SentAt | DateTime | Timestamp |
| Attachments | List<MessageAttachment> | Collection of file/image attachments |

### MessageAttachment (New)
Supports the "multiple attachments per message" requirement.

| Field | Type | Description |
|-------|------|-------------|
| Id | Guid | Primary Key |
| MessageId | Guid | Reference to Message |
| Url | String | Path to the file in `wwwroot/uploads` |
| FileName | String | Original filename |
| FileType | String | MIME type or category (Image, Document, Audio) |
| FileSize | Long | Size in bytes |

### CustomOffer (Updated)
Manages the lifecycle of tailored service quotes.

| Field | Type | Description |
|-------|------|-------------|
| Id | Guid | Primary Key |
| Title | String | Short title of the offer |
| Description | String | Detailed requirements |
| Price | Decimal | Total amount |
| DeliveryDays | Int | Estimated delivery time |
| Status | String | `Pending`, `Accepted`, `Rejected`, `Withdrawn`, `Expired` |
| ExecutorId | Guid | Reference to the service provider |
| StudentId | Guid | Reference to the student |
| CreatedAt | DateTime | Timestamp |

### Chat (Updated)
Supports private negotiation threads.

| Field | Type | Description |
|-------|------|-------------|
| Id | Guid | Primary Key |
| Type | Enum | `OrderChat`, `PrivateChat`, `TicketChat` |
| OrderId | Guid? | Linked order (null for Private/Ticket) |
| StudentId | Guid? | Participant (required for Private) |
| ExecutorId | Guid? | Participant (required for Private) |

## Relationships
- **Message** has many **MessageAttachments**.
- **Message** has zero or one **CustomOffer**.
- **Chat** has many **Messages**.
- **CustomOffer** can be converted into an **Order** upon acceptance.

## State Transitions: CustomOffer
1. **Created**: Status = `Pending`.
2. **Withdrawn**: Executor cancels. Status = `Withdrawn`. Final state.
3. **Rejected**: Student declines. Status = `Rejected`. Final state.
4. **Accepted**: Student accepts and pays. Status = `Accepted`. Triggers **Order** creation.
5. **Expired**: System timeout or manually superseded. Status = `Expired`. Final state.

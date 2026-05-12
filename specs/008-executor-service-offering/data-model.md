# Data Model: Executor Service Offering

## Entities

### Service (Updated)
Extends the existing `Service` entity to support the full marketplace lifecycle.

| Field | Type | Description |
|-------|------|-------------|
| Id | Guid | Primary Key |
| Title | String | Max 100 characters |
| Description | String | Rich text description |
| BasePrice | Decimal | Positive numeric value |
| CategoryId | Guid | FK to Category |
| ExecutorId | Guid | FK to User (Executor) |
| ImageUrl | String | Primary cover image |
| EstimatedDeliveryDays | Int | Positive integer |
| IncludedRevisions | Int | Non-negative integer |
| Status | String | `Draft`, `PendingApproval`, `Active`, `Paused`, `Rejected` |
| RejectionReason | String | Optional reason provided by Admin |
| CreatedAt | DateTime | Creation timestamp |
| UpdatedAt | DateTime | Last update timestamp |

### ServiceTag (New)
Searchable keywords for SEO and discovery.

| Field | Type | Description |
|-------|------|-------------|
| Id | Guid | Primary Key |
| Name | String | Unique tag name (e.g., "React", "Logo Design") |

### ServiceOfferingTag (New)
Join table for Many-to-Many relationship between Service and ServiceTag.

| Field | Type | Description |
|-------|------|-------------|
| ServiceId | Guid | FK to Service |
| TagId | Guid | FK to ServiceTag |

## Relationships
- **User (Executor)** has many **Services**.
- **Category** has many **Services**.
- **Service** has many **ServiceTags** (Many-to-Many).
- **Service** has many **Orders** (Existing).

## State Transitions
1. **Create**: User creates a service. Default status: `Draft`.
2. **Publish**: User submits for review. `Draft` -> `PendingApproval`.
3. **Approve**: Admin approves. `PendingApproval` -> `Active`.
4. **Reject**: Admin rejects. `PendingApproval` -> `Rejected`.
5. **Pause**: User hides service. `Active` -> `Paused`.
6. **Resume**: User re-activates. `Paused` -> `Active`.
7. **Edit**: User modifies. If `Active`, stays `Active`. If `Rejected`, returns to `Draft`.

# Data Model: Executor Marketplace Expansion

## New Entities

### GalleryItem
Represents an item in an executor's portfolio.
- `Id`: `Guid` (PK)
- `ExecutorId`: `Guid` (FK -> Users)
- `Title`: `string`
- `Description`: `string`
- `MediaUrl`: `string`
- `MediaType`: `string` (Image/Video)
- `CreatedAt`: `DateTime`

### ServiceApprovalLog
Tracks the history of service approvals and rejections.
- `Id`: `Guid` (PK)
- `ServiceId`: `Guid` (FK -> Services)
- `AdminId`: `Guid` (FK -> Users)
- `Action`: `string` (Approved/Rejected)
- `Reason`: `string?` (For rejections)
- `Timestamp`: `DateTime`

## Updated Entities

### User (Executor Extension)
- `GalleryItems`: `ICollection<GalleryItem>`
- `TotalWorkHours`: `int` (Calculated or manual)
- `Languages`: `List<string>`
- `LastActiveAt`: `DateTime`

### Service (Status Extension)
- `Status`: Enforced enum: `Draft`, `PendingApproval`, `Active`, `Rejected`, `Paused`.
- `RejectionReason`: `string?`

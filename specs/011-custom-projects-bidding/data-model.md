# Data Model: Custom Projects & Advanced Search

## New Entities

### ProjectRequest
Represents a student's custom job posting.
- `Id`: `Guid` (PK)
- `StudentId`: `Guid` (FK -> Users)
- `CategoryId`: `Guid` (FK -> Categories)
- `Title`: `string`
- `Description`: `string`
- `Budget`: `decimal`
- `Deadline`: `DateTime`
- `Status`: `string` (Open, Closed)
- `IsPublic`: `bool` (Default true)
- `CreatedAt`: `DateTime`

### ProjectOffer
Represents an executor's bid on a project.
- `Id`: `Guid` (PK)
- `ProjectRequestId`: `Guid` (FK -> ProjectRequests)
- `ExecutorId`: `Guid` (FK -> Users)
- `ProposedPrice`: `decimal`
- `ProposedDays`: `int`
- `CoverLetter`: `string`
- `Status`: `string` (Pending, Accepted, Rejected, ConvertedToOrder)
- `CreatedAt`: `DateTime`
- `UpdatedAt`: `DateTime`

### ProjectInvitation
Links a ProjectRequest to a specific Executor when a student sends a private invite.
- `Id`: `Guid` (PK)
- `ProjectRequestId`: `Guid` (FK -> ProjectRequests)
- `ExecutorId`: `Guid` (FK -> Users)
- `CreatedAt`: `DateTime`

## Updated Entities

### Chat
- `ProjectOfferId`: `Guid?` (Optional link to negotiation context)

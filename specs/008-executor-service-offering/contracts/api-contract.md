# API Contract: Executor Service Offering

## Executor API (`/api/Services`)

### GET /MyServices
Retrieves all services owned by the authenticated Executor.
- **Response**: `200 OK` with `List<ServiceSummaryDto>`.

### POST /
Creates a new service in `Draft` status.
- **Request**: `CreateServiceDto` (Title, Description, CategoryId, Price, DeliveryDays, Revisions, Tags).
- **Response**: `201 Created` with `ServiceDto`.

### PUT /{id}
Updates an existing service.
- **Request**: `UpdateServiceDto`.
- **Response**: `200 OK` with `ServiceDto`.

### POST /{id}/Submit
Submits a draft or rejected service for Admin approval.
- **Response**: `204 No Content`. Status becomes `PendingApproval`.

### POST /{id}/Pause
Hides an active service from the public catalog.
- **Response**: `204 No Content`. Status becomes `Paused`.

### POST /{id}/Resume
Makes a paused service visible again.
- **Response**: `204 No Content`. Status becomes `Active`.

## Admin API (`/api/Admin/Services`)

### GET /Pending
Lists all services awaiting review.
- **Response**: `200 OK` with `List<ServiceDto>`.

### POST /{id}/Approve
Approves a service for public listing.
- **Response**: `204 No Content`. Status becomes `Active`.

### POST /{id}/Reject
Rejects a service.
- **Request Body**: `{ "reason": "string" }`.
- **Response**: `204 No Content`. Status becomes `Rejected`.

## DTOs

### ServiceDto
```json
{
  "id": "guid",
  "title": "string",
  "description": "string",
  "basePrice": 150.00,
  "categoryId": "guid",
  "categoryName": "string",
  "imageUrl": "string",
  "deliveryDays": 3,
  "revisions": 2,
  "status": "Active",
  "tags": ["React", "TypeScript"],
  "rejectionReason": null
}
```

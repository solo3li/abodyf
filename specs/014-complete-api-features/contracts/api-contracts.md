# API Contracts: complete-api-features

## Withdrawals (`/api/Wallet/Withdrawals`)

### POST `/` (Executor)
Request a payout.
- **Request**: `multipart/form-data`
  - `Amount`: decimal
  - `Screenshot`: IFormFile (Mandatory)
- **Response**: `201 Created` (WithdrawalRequest DTO)

### GET `/Admin` (Admin)
List all withdrawal requests.
- **Query**: `status` (Pending/Approved/Rejected)
- **Response**: `200 OK` (List<WithdrawalRequestDto>)

### POST `/Admin/{id}/Resolve` (Admin)
Approve or reject a payout.
- **Request**: 
  - `Status`: Approved | Rejected
  - `AdminNotes`: string
- **Response**: `200 OK`

---

## Reviews (`/api/Reviews`)

### POST `/` (Student)
Submit a review for a completed order.
- **Request**:
  - `OrderId`: Guid
  - `Rating`: 1-5
  - `Comment`: string
- **Response**: `201 Created`

### POST `/{id}/Reply` (Executor)
Respond to a review.
- **Request**: `string content`
- **Response**: `200 OK`

---

## Disputes (`/api/Orders/{id}/Dispute`)

### POST `/` (Student)
Flag an order as disputed.
- **Request**: `multipart/form-data`
  - `Description`: string
  - `Evidence`: IFormFile
- **Response**: `201 Created` (Dispute DTO)

### POST `/Admin/{id}/Resolve` (Admin)
Resolve a dispute.
- **Request**:
  - `Resolution`: RefundToStudent | ReleaseToExecutor
  - `AdminNotes`: string
- **Response**: `200 OK`

---

## Admin Stats (`/api/Admin/Dashboard`)

### GET `/Stats`
Platform KPIs.
- **Response**: `200 OK`
  ```json
  {
    "TotalOrders": 1250,
    "ActiveExecutors": 45,
    "TotalRevenue": 50000.0,
    "PendingWithdrawalsCount": 3,
    "DisputedOrdersCount": 1
  }
  ```

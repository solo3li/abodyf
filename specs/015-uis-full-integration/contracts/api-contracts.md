# API Contracts: uis-full-integration

## Wallet Controller

### Request Deposit
- **Endpoint**: `POST /api/Wallet/Deposits`
- **Auth**: Required
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `Amount`: Decimal
  - `Screenshot`: IFormFile
- **Response**: `200 OK` (DepositRequest object)

### Request Withdrawal
- **Endpoint**: `POST /api/Wallet/Withdrawals`
- **Auth**: Required (Role: Executor)
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `Amount`: Decimal
  - `Screenshot`: IFormFile (Optional proof of previous identity/status if needed)
- **Response**: `200 OK` (WithdrawalRequest object)

## Reviews Controller

### Submit Review
- **Endpoint**: `POST /api/Reviews`
- **Auth**: Required (Role: Student)
- **Request Body**:
  - `OrderId`: Guid
  - `Rating`: Integer (1-5)
  - `Comment`: String
- **Response**: `201 Created`

### Get Executor Reviews
- **Endpoint**: `GET /api/Reviews/Executor/{executorId}`
- **Auth**: Required
- **Response**: `200 OK` (List of Review objects)

## Admin Endpoints (MVC)

### Resolve Deposit
- **Endpoint**: `POST /Admin/ResolveDeposit`
- **Auth**: Required (Role: Admin)
- **Form Data**:
  - `id`: Guid
  - `resolution`: String ("Approved", "Rejected")
  - `adminNotes`: String (Optional)
- **Response**: `302 Redirect` to `/Admin/Deposits`

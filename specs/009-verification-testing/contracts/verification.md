# API Contract Verification: Critical Workflows

## 1. Search Contract
**Endpoint**: `GET /api/Services`
**Parameters**:
- `search`: string (partial match on title/description)
- `categoryId`: string (optional filter)
- `minPrice`: decimal (optional)
- `maxPrice`: decimal (optional)
**Expected Response**: `List<ServiceDto>`

## 2. Order Lifecycle Contract
**Endpoint**: `POST /api/Orders/{id}/Accept`
**Role**: Executor
**Effect**: Status changes to `InProgress`.

**Endpoint**: `POST /api/Orders/{id}/Complete`
**Role**: Executor
**Effect**: Status changes to `Completed`. Triggers `EscrowRelease`.

## 3. Admin Balance Adjustment Contract
**Endpoint**: `POST /Admin/AdjustBalance`
**Role**: Admin
**Payload**:
```json
{
  "userId": "uuid",
  "amount": decimal,
  "type": "Credit|Debit",
  "reason": "string"
}
```
**Effect**: Wallet balance updated. Audit log entry created.

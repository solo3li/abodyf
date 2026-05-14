# API Contract: Wallet

## Get User Wallet
`GET /api/Wallet`

**Authentication**: Required (JWT)

### Responses
- `200 OK`: Returns balance, currency, and transaction history.
- `401 Unauthorized`: Token is missing or invalid.
- `404 Not Found`: User record not found in database.

---

# API Contract: Orders

## Accept Order
`POST /api/Orders/{id}/Accept`

**Authentication**: Required (JWT, Executor role)

### Parameters
- `id` (path): GUID of the order to accept.

### Responses
- `200 OK`: Order accepted successfully.
- `400 BadRequest`: Order is not in "Pending" status or already accepted.
- `401 Unauthorized`: Token is missing or invalid.
- `404 Not Found`: Order ID does not exist.

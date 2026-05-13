# API Contracts: Platform Polish & Wallet

## 1. Wallet API

### `GET /api/Wallet`
Retrieves current user's balance and recent transactions.

**Response:**
```json
{
  "balance": 150.50,
  "currency": "ج.م",
  "transactions": [
    {
      "id": "uuid",
      "amount": 50.00,
      "type": "TopUp",
      "description": "شحن المحفظة",
      "createdAt": "2026-05-13T10:00:00Z"
    },
    {
      "id": "uuid",
      "amount": -100.00,
      "type": "OrderPayment",
      "description": "دفع طلب #1234",
      "createdAt": "2026-05-12T15:30:00Z"
    }
  ]
}
```

### `POST /api/Wallet/TopUp`
Simulates adding funds to the wallet.

**Request:**
```json
{
  "amount": 100.00
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "newBalance": 250.50,
  "transactionId": "uuid"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "المبلغ يجب أن يكون أكبر من 0 ولا يتجاوز 10,000 ج.م"
}
```

## 2. Order Actions

### `POST /api/Orders/{id}/Accept`
Allows an executor to claim a "Pending" order.

**Response (200 OK):**
```json
{
  "success": true,
  "orderId": "uuid",
  "newStatus": "InProgress"
}
```

### `POST /api/Orders/{id}/Complete`
Allows an executor to mark an order complete, triggering escrow release.

**Response (200 OK):**
```json
{
  "success": true,
  "orderId": "uuid",
  "newStatus": "Completed",
  "escrowStatus": "Released",
  "walletCredited": 100.00
}
```

## 3. Search Enhancement

### `GET /api/Services?search={query}&categoryId={id}`
Existing endpoint modified to support search and filtering.

**Query Parameters:**
- `search` (string, optional): Matches against Title or Description.
- `categoryId` (uuid, optional): Filters by category.

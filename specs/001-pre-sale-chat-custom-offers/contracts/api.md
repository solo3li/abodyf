# API Contracts: Custom Offers

## Chat Endpoints

### POST /api/Chat/{chatId}/Offer
Send a custom offer to a student in a private chat.

**Request Body:**
```json
{
  "serviceId": "guid?",
  "description": "string",
  "price": 150.00,
  "deliveryDays": 3
}
```

**Response:**
Returns the created `CustomOffer` object.

---

### POST /api/Chat/Offer/{offerId}/Decline
Student declines a received offer.

**Response:**
`200 OK`

---

### POST /api/Chat/Offer/{offerId}/Withdraw
Executor withdraws an offer before it is accepted.

**Response:**
`200 OK`

## Order Endpoints

### POST /api/Orders/FromOffer/{offerId}
Accept a custom offer and initiate the order/payment workflow.

**Response:**
Returns the created `Order` object.
**Error (400):** If offer is not `Pending`.

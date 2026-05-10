# Research: Pre-sale Chat and Custom Offers

## Decision: Data-Model Extensions
I will implement `CustomOffer` as a separate entity rather than just a message subtype to ensure robust status tracking (Pending, Accepted, Declined) and link it to the `Message` for chat display.

### Rationale
- Status tracking is critical for "Accept Offer" logic.
- Separation of concerns: Messages are transient communication; Offers are legal/financial proposals.
- Better reporting and administrative oversight in the Admin Panel.

### Alternatives Considered
- **JSON in Message Content:** Rejected because it makes querying and status management difficult and error-prone.
- **Subclassing Message:** Rejected because EF Core TPH (Table-Per-Hierarchy) can add complexity to a simple chat system.

## Decision: SignalR Integration
Custom offers will be broadcast via the existing `ChatHub` using a new `ReceiveCustomOffer` event or by extending the existing `ReceiveMessage` payload with an `OfferId`.

### Rationale
- Reuses existing SignalR connection and group management (ChatId).
- Minimizes frontend changes needed for real-time updates.

## Decision: Order Creation Flow
Accepting a custom offer will hit a new endpoint `POST /api/Orders/FromOffer/{id}` which will validate the offer status, create the order with the offer's price, and update the offer status to `Accepted`.

### Rationale
- Encapsulates the logic in the backend.
- Prevents price tampering from the frontend (price is pulled from the DB record of the offer).

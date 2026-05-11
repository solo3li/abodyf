# Research: Advanced Chat System

## Decision: 1. Chat Type Discrimination
- **Chosen**: Add a `ChatType` enum (`OrderChat`, `PrivateChat`, `TicketChat`) to the `Chat` and `Ticket` (if integrated) entities. Migrate existing chats to `OrderChat` if `OrderId` is not null, otherwise `PrivateChat`.
- **Rationale**: Based on the clarification to maintain backward compatibility while supporting new private inboxes.
- **Alternatives Considered**: Creating completely separate tables (rejected: harder to reuse UI components and SignalR hubs).

## Decision: 2. Real-Time Architecture
- **Chosen**: Create a separate `PrivateChatHub` for the new Inbox, distinct from the existing `ChatHub` used for orders.
- **Rationale**: Clarified requirement to isolate the private inbox real-time traffic from active order chats.
- **Alternatives Considered**: Reusing the existing `ChatHub` with new payload types (rejected by user preference for separation).

## Decision: 3. Rich Media & Voice Storage
- **Chosen**: Use the existing local `wwwroot/uploads` file system with a strict 20MB file size limit enforced on the server.
- **Rationale**: Matches the clarification to use existing local storage rather than introducing cloud dependencies (AWS/R2) at this stage.
- **Alternatives Considered**: Cloudinary / AWS S3 (rejected: out of scope for current infrastructure).

## Decision: 4. Audio Format & Capture
- **Chosen**: Client (React Native/Expo) will record using standard formats (e.g., `m4a` or `aac`) using `expo-av` and upload via multipart form-data.
- **Rationale**: Standard cross-platform support.
- **Alternatives Considered**: `wav` (rejected: larger file size).

## Decision: 5. Custom Offers
- **Chosen**: Add a `CustomOfferId` to the `Message` model (which links to a new `CustomOffer` table or embed as JSON in `Content` if simple enough, but a separate table is safer for state management). They will be exclusive to `PrivateChatHub`.
- **Rationale**: Meets the requirement to restrict them to the pre-order private inbox only.

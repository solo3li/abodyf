# Feature Specification: Advanced Chat System

**Feature Branch**: `007-advanced-chat-system`  
**Created**: 2026-05-11  
**Status**: Draft  
**Input**: User description: "add ability chate with sevice excuter in private chate far that chate order like fivar like inbox + add ability excuter send custom oferres like fiver + improve chate in app platform in orders chats and private chats and tikets suport and admin pannel add ability send imges and files and imges + and voce recordding + display voce in audio visualizer with somth andmations and make it dynamicly during recording and chat + add abilit listen record berfor send it and i want it profinal make it changes i all system"

## Clarifications

### Session 2026-05-11
- Q: Where should the new Private Chats (Inbox) be located in the UI? → A: Create a brand new dedicated "Inbox" tab just for private chats.
- Q: Should Custom Offers be available in all chats, or just the Private Inbox? → A: Exclusive to Private Inbox (Pre-order negotiation only).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Private Pre-Order Messaging (Inbox) (Priority: P1)

As a Student, I want to message a Service Executor privately before placing an order, so that I can discuss my specific requirements and negotiate terms.

**Why this priority**: Crucial for complex service requests where standard packages don't fit.

**Independent Test**: Navigate to a Service Provider's profile or service page, initiate a private message, send text, and verify the message appears in a unified "Inbox" separate from active order chats.

**Acceptance Scenarios**:
1. **Given** a user is viewing a service, **When** they click "Contact Provider", **Then** a private chat session is initiated without requiring an active order.
2. **Given** an active private chat, **When** either party sends a message, **Then** it appears instantly in the other party's Inbox.

---

### User Story 2 - Custom Offers (Priority: P1)

As a Service Executor, I want to send a custom offer (price, delivery time, description) directly within a private chat, so that I can provide tailored quotes based on the Student's specific needs.

**Why this priority**: Empowers providers to close deals that fall outside standard service packages.

**Independent Test**: As an Executor in a private chat, click "Create Custom Offer", fill in details, and send. The Student should receive a structured message block with an "Accept & Pay" button.

**Acceptance Scenarios**:
1. **Given** a private chat, **When** an Executor sends a custom offer, **Then** it appears as a distinct, actionable widget in the chat feed.
2. **Given** a custom offer widget, **When** the Student clicks "Accept", **Then** they are taken to the checkout flow to confirm the order.

---

### User Story 3 - Rich Media Attachments (Priority: P1)

As any user (Student, Executor, Admin), I want to send images and document files in any chat context (Private, Order, Support Ticket), so that I can share necessary references and deliverables.

**Why this priority**: Visual context is necessary for most service types (design, coding, writing).

**Independent Test**: In any chat, click the attachment icon, select an image/document, and send. Verify the file uploads and renders inline (if image) or as a downloadable link (if document).

**Acceptance Scenarios**:
1. **Given** any chat interface, **When** a user uploads an image, **Then** it displays as a thumbnail that can be expanded.
2. **Given** any chat interface, **When** a user uploads a document (PDF, DOCX), **Then** it displays as a file icon with the filename and a download action.

---

### User Story 4 - Voice Recording with Visualization (Priority: P2)

As any user, I want to record and send voice messages, so that I can quickly explain complex ideas without typing.

**Why this priority**: Significantly improves accessibility and communication speed on mobile devices.

**Independent Test**: Press and hold the microphone icon. Verify a real-time waveform visualizer appears. Release to preview, then send. Verify the playback includes a static waveform visualizer.

**Acceptance Scenarios**:
1. **Given** the chat input area, **When** the user starts recording, **Then** a dynamic, smooth audio visualizer animates in real-time based on voice input.
2. **Given** a finished recording, **When** the user stops, **Then** they can listen to the recording before deciding to send or discard it.
3. **Given** a sent voice message, **When** it appears in the chat, **Then** it features a playback control and a visual representation of the audio waveform.

---

### Edge Cases

- **What happens if a user records audio while offline?**: The recording should be saved locally and queued for upload once the connection is restored, or the user should be prompted that an active connection is required.
- **What happens if a Custom Offer is rejected or ignored?**: The offer widget should update its state to "Expired" or "Rejected" and disable the "Accept & Pay" button.
- **How are very large attachments handled?**: The system must enforce a maximum file size (e.g., 20MB) and present a clear error message if the limit is exceeded before upload begins.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support Private Chats that are independent of specific Orders, accessible via a dedicated "Inbox" tab in the main navigation.
- **FR-002**: Executors MUST be able to generate and send Custom Offer payloads (Title, Description, Price, Delivery Time) within Private Chats.
- **FR-003**: The chat system MUST support multipart file uploads for images (JPG, PNG) and standard documents (PDF, DOCX).
- **FR-004**: The chat interface MUST include a voice recording feature that captures device audio.
- **FR-005**: Voice recording MUST display a real-time dynamic waveform animation during capture.
- **FR-006**: Users MUST be able to preview (listen to) their voice recording before sending.
- **FR-007**: Voice messages in the chat feed MUST display a playable audio component with a waveform visualization.
- **FR-008**: These advanced chat features (attachments, voice, real-time sync) MUST be uniformly implemented across contexts, but the Private Inbox MUST utilize a dedicated real-time hub (e.g., `PrivateChatHub`) separated from the active Order/Ticket chats.

### Key Entities *(include if feature involves data)*

- **Chat**: Needs an indicator (e.g., `ChatType` enum) to distinguish between `OrderChat`, `PrivateChat`, and `TicketChat`. (Note: Existing DB records will be migrated to `OrderChat`).
- **Message**: Needs robust typing to handle `Text`, `Image`, `Document`, `Audio`, and `CustomOffer` payloads.
- **CustomOffer**: Links to a `Message` and eventually an `Order`. Fields: Price, DeliveryDays, Description, Status (Pending, Accepted, Rejected).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Custom offers can be created and sent in under 10 seconds by the Executor.
- **SC-002**: Audio recordings process and upload in under 3 seconds after the user clicks send.
- **SC-003**: Chat messages (text, audio links, image links) sync between clients with less than 500ms latency.
- **SC-004**: Voice visualization animations render smoothly at 60fps on mobile devices during recording.

## Assumptions

- **Storage**: The system will utilize the existing local file storage (`wwwroot/uploads`) for all chat attachments and voice records, enforcing a hard 20MB limit.
- **Audio Format**: Voice recordings will be saved in a standard, cross-platform format (e.g., MP4/AAC or WebM).
- **Permissions**: The mobile app will handle requesting microphone and file storage permissions natively.
bM).
- **Permissions**: The mobile app will handle requesting microphone and file storage permissions natively.

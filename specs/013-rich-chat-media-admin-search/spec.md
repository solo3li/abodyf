# Feature Specification: Rich Chat Media, Admin Service Approval & Advanced Search

**Feature Branch**: `013-rich-chat-media-admin-search`
**Created**: 2026-05-13
**Status**: Draft
**Input**: User description: "improve chat display any thing in chat message and videos or voices with voice visualizer with smooth animations and dynamically and make it professional and ability listen voice before send it and improve it in all platforms in uis and admin panel in chats and tickets support in all + improve home uis + improve inbox chats and test it and + offers and projects + services add section in admin panel to accept executors service before display it for students add ability search in executors and service with advanced filters"

---

## User Scenarios & Testing *(mandatory)*

**Note**: Per Constitution Principle III (v1.2.0), every user story MUST be verified with automated
tests in **both** frontend (Jest) and backend (xUnit) to ensure 100% functionality. Features MUST
be implemented completely — no stubs or unfinished paths — and committed only after both test
suites pass.

---

### User Story 1 — Rich Media Chat Messages (Priority: P1)

As a student or executor, I want to send and receive rich media content in conversations
(images, videos, voice recordings, files) so that I can communicate effectively beyond plain text.

**Why this priority**: Chat is the primary communication channel between students and executors.
Rich media dramatically improves the quality of project discussions and is essential before all
other chat enhancements.

**Independent Test**: A user can open any conversation, send a voice message, see the waveform
visualizer, play it back, and the message appears in the thread for both parties — completely
independently of other improvements.

**Acceptance Scenarios**:

1. **Given** a user is in an active chat conversation, **When** they record a voice message, **Then** a real-time waveform visualizer animates smoothly during recording, and the user can play back the recording before deciding to send or discard it.
2. **Given** a user has recorded a voice message, **When** they play it back, **Then** audio plays with a synchronized animated progress bar and duration timer visible on the message bubble.
3. **Given** a user sends an image or video, **When** the recipient opens the conversation, **Then** the media is displayed inline within the message thread with a thumbnail and tap-to-expand/play interaction.
4. **Given** a user sends a file attachment, **When** the recipient views it, **Then** a file-type icon, file name, and size are shown with a download action.
5. **Given** a conversation contains mixed media messages, **When** any user scrolls through it, **Then** smooth animated transitions between message types are visible with no layout jank.
6. **Given** a user is on any platform (iOS, Android, Web), **When** they interact with any media in chat, **Then** the experience is functionally consistent across all platforms.

---

### User Story 2 — Voice Message Pre-Send Preview (Priority: P1)

As a user composing a voice message, I want to preview and optionally re-record my voice before
sending it so that I can ensure quality before the other party hears it.

**Why this priority**: Pre-send preview is a core quality-of-life feature users expect from any
modern voice messaging system. It directly impacts satisfaction with the voice recording flow
defined in User Story 1.

**Independent Test**: Record a voice message → see waveform → tap play → hear the recording →
choose to send or discard — all without sending to confirm the full preview loop works end-to-end.

**Acceptance Scenarios**:

1. **Given** a user finishes recording a voice message, **When** the recording stops, **Then** a preview panel appears with the waveform, total duration, and Play / Discard / Send actions.
2. **Given** a user taps Play in the preview panel, **Then** the voice message plays from the beginning with an animated playback indicator.
3. **Given** a user taps Discard, **Then** the recording is deleted and the input returns to its default state with no data retained.
4. **Given** a user taps Send, **Then** the voice message is sent immediately and appears in the conversation thread.

---

### User Story 3 — Chat & Ticket Support in Admin Panel (Priority: P2)

As an admin, I want to view, monitor, and respond to all chat conversations and support tickets
across the platform so that I can moderate activity and resolve escalations.

**Why this priority**: Admin visibility into chats and tickets is required for platform governance.
It builds on the rich media foundation from US1/US2 — the admin panel must render the same media
types.

**Independent Test**: Log in as admin → navigate to the Chat Management section → view a
conversation thread with mixed media → reply to a support ticket — all completable without any
student or executor being online.

**Acceptance Scenarios**:

1. **Given** an admin is in the Chat Management section, **When** they browse conversations, **Then** all conversation threads (student↔executor, support tickets) are listed with unread count, last message preview, and timestamp.
2. **Given** an admin opens a conversation, **When** the thread loads, **Then** all message types (text, voice, image, video, file) render correctly using the same rich media components as the UIS app.
3. **Given** an admin views a support ticket, **When** they click Reply, **Then** they can send a text reply and attach files, and the response appears in the ticket thread visible to the submitting user.
4. **Given** a new support ticket is submitted, **When** the admin panel is open, **Then** the admin receives a real-time notification badge with the ticket details.

---

### User Story 4 — Home Screen UIS Improvements (Priority: P2)

As a student using the Home screen, I want to see a visually polished, up-to-date feed of
services, executors, offers, and projects so that I can quickly find and act on what is most
relevant to me.

**Why this priority**: The Home screen is the first thing students see; it sets the quality
perception of the platform. Improved data accuracy and visual design directly increase engagement.

**Independent Test**: Open the app as a student on a fresh session → the Home screen loads in
under 2 seconds → shows active services, featured executors, current offers, and recent projects
with correct data — verifiable without navigating away.

**Acceptance Scenarios**:

1. **Given** a student opens the app, **When** the Home screen loads, **Then** all sections (Services, Executors, Offers, Projects) display accurate live data with no stale or empty states.
2. **Given** the Home screen is loaded, **When** a student scrolls, **Then** section transitions animate smoothly and skeleton placeholders appear during any data loading.
3. **Given** a student taps a service, executor, offer, or project card on Home, **Then** they navigate to the correct detail screen without errors.
4. **Given** the Home screen has loaded, **When** a student pulls to refresh, **Then** all sections update with the latest data within 3 seconds.

---

### User Story 5 — Inbox Chat Improvements (Priority: P2)

As a student or executor, I want an improved inbox that shows all my conversations in one place
with unread counts, search, and media previews so that I can manage my communications efficiently.

**Why this priority**: The inbox is the gateway to all chats. A well-organized inbox reduces missed
messages and improves response rates for both students and executors.

**Independent Test**: Open the Inbox → see a list of conversations with last message preview
(including media type indicators) → search for a contact name → tap to open a conversation — all
without sending any new messages.

**Acceptance Scenarios**:

1. **Given** a user opens the Inbox, **When** conversations are listed, **Then** each row shows: contact name/avatar, last message preview (or media-type label for voice/image/video), unread badge, and timestamp.
2. **Given** a user has unread messages, **When** they view the Inbox, **Then** unread conversations are visually distinguished with a bold style and badge count.
3. **Given** a user searches in the Inbox search bar, **When** they type a contact name or keyword, **Then** matching conversations filter in real time with highlighted matches.
4. **Given** a user taps a conversation in the Inbox, **When** the thread opens, **Then** it scrolls to the most recent unread message automatically.

---

### User Story 6 — Admin Service Approval Workflow (Priority: P1)

As an admin, I want to review and approve or reject executor service listings before they become
visible to students so that only quality, verified services are discoverable on the platform.

**Why this priority**: Service quality control is a core trust mechanism for the platform. Without
approval gates, low-quality or inappropriate services could appear immediately, harming student
trust.

**Independent Test**: Create a new service as an executor → log in as admin → navigate to the
Service Approval queue → approve the service → log back in as a student → confirm the service now
appears in search results — end-to-end verifiable with no other dependencies.

**Acceptance Scenarios**:

1. **Given** an executor submits a new service listing, **When** the listing is saved, **Then** its status is "Pending Approval" and it does NOT appear in any student-facing view.
2. **Given** an admin navigates to the Service Approval section, **When** pending services are listed, **Then** each entry shows the service title, executor name, category, price, description, and submission date.
3. **Given** an admin reviews a pending service, **When** they click Approve, **Then** the service status changes to "Active" and it becomes immediately visible to students in search results.
4. **Given** an admin reviews a pending service, **When** they click Reject with an optional reason, **Then** the service status changes to "Rejected", it remains hidden from students, and the executor receives a notification with the rejection reason.
5. **Given** an admin approves or rejects a service, **When** the action is completed, **Then** the admin can add review notes that are stored with the service record for audit purposes.
6. **Given** a student searches for services, **When** results are returned, **Then** only "Active" (approved) services are shown; Pending and Rejected services are never included.

---

### User Story 7 — Advanced Search: Executors & Services (Priority: P2)

As a student, I want to search for executors and services using advanced filters so that I can
quickly find exactly what I need rather than browsing long unfiltered lists.

**Why this priority**: Discovery quality directly affects conversion from browse to hire. Advanced
search reduces time-to-match for students and surfaces relevant executors and services effectively.

**Independent Test**: Open the search screen → enter a keyword → apply category, price range, and
rating filters → see filtered results update in real time — verifiable without placing any order.

**Acceptance Scenarios**:

1. **Given** a student opens the search screen, **When** they type a keyword, **Then** matching executors and services appear as results within 1 second, showing relevant preview cards.
2. **Given** a student is viewing search results, **When** they open the advanced filters panel, **Then** they can set: category, subcategory, price range (min/max), minimum rating, availability (available now / scheduled), delivery timeframe, and sort order (relevance, rating, price, newest).
3. **Given** a student applies one or more filters, **When** results update, **Then** only results matching ALL active filters are shown, and a filter summary chip bar shows active filters with individual dismiss controls.
4. **Given** a student clears all filters, **When** results refresh, **Then** the full unfiltered result set is restored instantly.
5. **Given** there are no results for the applied filters, **When** the empty state appears, **Then** a helpful message suggests broadening filters or browsing related categories.
6. **Given** an admin views the Executor Management section, **When** they use the executor search with filters (name, specialty, status, join date), **Then** only executors matching all active filters are listed.

---

### Edge Cases

- What happens when a voice message recording is interrupted by an incoming call or app backgrounding?
- How does the system handle a video attachment that exceeds the maximum allowed file size?
- What if a service is edited by an executor after approval — does it revert to "Pending Approval"?
- What if an executor submits a service that is identical to a previously rejected one?
- What happens when a search returns thousands of results — is pagination or infinite scroll used?
- How are voice messages displayed in conversations when the device has audio access disabled?
- What if an admin rejects a service that already has active orders attached to it?

---

## Requirements *(mandatory)*

### Functional Requirements

**Rich Chat Media**

- **FR-001**: Users MUST be able to record voice messages within any chat conversation or support ticket thread, with a real-time waveform visualizer displayed during recording.
- **FR-002**: Users MUST be able to preview a recorded voice message (play, re-record, discard) before sending it.
- **FR-003**: Chat messages MUST support inline display of images (thumbnail + full-screen view), videos (thumbnail + in-app playback), voice recordings (waveform bubble + playback), and file attachments (icon + download).
- **FR-004**: Voice message playback MUST show an animated progress indicator synchronized with audio playback position and display message duration.
- **FR-005**: All rich media features MUST function consistently on iOS, Android, and Web platforms within the UIS app.
- **FR-006**: The admin panel chat and ticket views MUST render the same rich media message types as the UIS app.
- **FR-007**: Smooth entry/exit animations MUST be applied to all message types as they appear in the conversation thread.

**Home Screen UIS**

- **FR-008**: The Home screen MUST display live, accurate data for Services, Executors, Offers, and Projects sections on every load.
- **FR-009**: The Home screen MUST show skeleton loading placeholders for all sections while data is being fetched.
- **FR-010**: Tapping any card on the Home screen MUST navigate to the correct detail view without errors.

**Inbox Chat**

- **FR-011**: The Inbox MUST display conversations with: contact name, avatar, last message preview or media-type label, unread badge count, and timestamp.
- **FR-012**: Unread conversations in the Inbox MUST be visually distinct from read ones.
- **FR-013**: The Inbox MUST include a real-time search bar that filters conversations by contact name or recent message content.
- **FR-014**: Opening a conversation from the Inbox MUST automatically scroll to the first unread message.

**Admin Service Approval**

- **FR-015**: Newly submitted executor service listings MUST default to "Pending Approval" status and MUST NOT appear in any student-facing discovery surface.
- **FR-016**: Admins MUST have a dedicated Service Approval queue showing all pending services with full listing details.
- **FR-017**: Admins MUST be able to Approve or Reject any pending service with an optional written reason.
- **FR-018**: Approved services MUST become immediately visible in student-facing search and discovery. Rejected services MUST remain hidden.
- **FR-019**: Executors MUST receive an in-app notification when their service is approved or rejected, including the rejection reason if applicable.
- **FR-020**: Service edits by an executor on an already-approved service MUST revert the service to "Pending Approval" until re-reviewed by an admin.
- **FR-021**: The service record MUST store full audit history: submission date, reviewer identity, decision, timestamp, and review notes.

**Advanced Search & Filters**

- **FR-022**: Students MUST be able to search executors and services by keyword with results appearing within 1 second of input.
- **FR-023**: The search interface MUST provide advanced filter controls: category, subcategory, price range, minimum rating, availability, delivery timeframe, and sort order.
- **FR-024**: Active filters MUST be displayed as dismissible chip badges in a filter summary bar; clearing a chip removes only that filter.
- **FR-025**: The admin Executor Management screen MUST include a filterable search for executors by name, specialty, status, and join date.
- **FR-026**: Search results MUST only include approved ("Active") services; pending and rejected services MUST be excluded.

### Key Entities

- **Message**: Content unit in a conversation. Types: text, voice, image, video, file. Attributes: sender, timestamp, read status, media metadata (duration, size, MIME type, thumbnail URL).
- **VoiceRecording**: Pre-send recording object. Attributes: audio data, duration, waveform amplitude data, status (recording / preview / discarded / sent).
- **ServiceListing**: An executor's offered service. Attributes: title, description, category, subcategory, price, delivery time, status (Pending / Active / Rejected / Suspended), submission date, approvedBy, rejectedReason, auditLog.
- **ServiceAuditEntry**: Single audit record on a ServiceListing. Attributes: action (submitted / approved / rejected / edited), actorId, actorRole, timestamp, notes.
- **SearchFilter**: Ephemeral user state. Attributes: keyword, category, subcategory, priceMin, priceMax, minRating, availability, deliveryTimeframe, sortOrder.
- **Conversation**: Thread between two or more participants. Attributes: participants, lastMessage, unreadCounts, type (direct / support ticket).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Voice message recording, preview, and sending completes in under 5 seconds for a 30-second recording on an average mobile connection.
- **SC-002**: All rich media message types (voice, image, video, file) render correctly in 100% of supported platform combinations (iOS, Android, Web) as verified by automated cross-platform tests.
- **SC-003**: Home screen displays complete data for all sections within 2 seconds on a standard mobile connection.
- **SC-004**: Inbox search filters conversations in under 500 milliseconds as the user types, with no perceptible lag.
- **SC-005**: No pending or rejected service appears in any student-facing search result — 0% leakage rate as verified by contract tests.
- **SC-006**: Admins can process (approve or reject) a pending service listing in under 60 seconds from opening the approval queue.
- **SC-007**: Advanced search with up to 7 simultaneous active filters returns results within 1 second for a catalog of up to 10,000 services.
- **SC-008**: 100% of executor service submission, approval, and rejection events are recorded in the audit log with actor, timestamp, and notes.
- **SC-009**: Waveform visualizer animates at a consistent frame rate with no visible stutter during voice recording across all supported platforms.
- **SC-010**: Unread message badge counts in the Inbox update in real time without requiring a manual refresh.

---

## Assumptions

- The existing real-time messaging infrastructure (SignalR or equivalent) is already in place and will be extended — not replaced — by this feature.
- Audio recording permissions are requested from the OS at the point of first use; the system handles graceful degradation when permission is denied.
- Maximum file size for media attachments is 50 MB per file (images/videos/files); voice messages are limited to 5 minutes. These limits are enforced both client-side and server-side.
- Service listing edits that change only non-substantive metadata (e.g., thumbnail image only) also trigger re-approval, as distinguishing "substantive" vs. "cosmetic" edits introduces complexity beyond scope.
- The admin panel is a web application; UIS is the mobile app (iOS/Android) plus a web version. Both share the same backend.
- Executor notification delivery (for approval/rejection) uses the existing in-app notification system already present in the project.
- Search results are paginated with a default page size of 20 items; infinite scroll is used on mobile and pagination controls on web.
- The waveform visualizer uses amplitude data sampled from the audio recording on-device; no server-side audio processing is required for visualization.
- Only platform admins (not executors or students) can access the Service Approval queue and Executor Management admin screens.

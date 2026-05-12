# Feature Specification: Custom Projects & Advanced Search

**Feature Branch**: `011-custom-projects-bidding`  
**Created**: 2026-05-12  
**Status**: Draft  
**Input**: User description: "improve side bar + home page + search page with advanced filiter + add seacion for side bar in admin to abrove servies ofers for excuters befor add it to servess + add part in for custome projects like upwork and excuter send offers and student aprove offers i want improved design modern and provssional"

## User Scenarios & Testing *(mandatory)*

**Note**: Per Constitution Principle III, every user story MUST be verified with automated tests in both frontend and backend to ensure 100% functionality.

### User Story 1: Custom Project Requests (Priority: P1)

As a Student, I want to post a custom project request detailing my specific needs so that executors can send me tailored offers.

**Why this priority**: Introduces a reverse-marketplace (Upwork-style) model, which is a major new revenue channel.

**Acceptance Scenarios**:
1. **Given** I am a Student, **When** I click "Request Custom Project", **Then** I can fill out a form with title, description, budget, and deadline.
2. **Given** I have posted a project, **When** I view "My Projects", **Then** I see its status as "Open for Bidding" and can view incoming offers from executors.

---

### User Story 2: Executor Bidding System (Priority: P1)

As an Executor, I want to browse open custom projects and submit my offers (price and timeline) so that I can win new work.

**Why this priority**: Completes the custom project loop; allows executors to proactively seek work.

**Acceptance Scenarios**:
1. **Given** I am an Executor, **When** I browse "Available Projects", **Then** I see requests posted by students.
2. **Given** an open project, **When** I submit an offer with my proposed price and delivery time, **Then** the student is notified, and my offer appears as "Pending" in my dashboard.

---

### User Story 3: Offer Acceptance & Order Creation (Priority: P1)

As a Student, I want to review offers on my custom project and accept the best one so that an official order is created and work can begin.

**Why this priority**: Connects the bidding system to the existing Order and Escrow infrastructure.

**Acceptance Scenarios**:
1. **Given** I receive multiple offers on my project, **When** I click "Accept" on an executor's offer, **Then** the project is closed to new bids.
2. **Given** an accepted offer, **When** the transaction processes, **Then** a new Order is generated with the agreed-upon price and timeline.

---

### User Story 4: Advanced Search Filters (Priority: P2)

As a User, I want advanced filtering options (price range, rating, delivery time) on the search page so that I can find exactly what I need quickly.

**Why this priority**: Improves discovery and user experience on the recently updated search page.

**Acceptance Scenarios**:
1. **Given** I am on the Search page, **When** I open the "Advanced Filters" sheet, **Then** I can set minimum/maximum price and minimum rating.
2. **Given** active filters, **When** I apply them, **Then** the search results immediately update to match my criteria.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-011-01**: Custom Project Entity: Create a `ProjectRequest` entity allowing students to post needs. Projects are public by default, but students can also send private invitations to specific executors.
- **FR-011-02**: Project Bidding: Create a `ProjectOffer` entity allowing executors to bid on `ProjectRequests`. Executors have unlimited bidding capabilities.
- **FR-011-03**: Pre-Acceptance Negotiation: Implement a chat integration directly from the pending offer screen, allowing students and executors to discuss details. Executors can update their offer terms during this negotiation.
- **FR-011-04**: Offer Arbitration: When a student accepts a `ProjectOffer`, automatically generate a standard `Order` and reject all other pending offers.
- **FR-011-05**: Advanced Search UI: Add a filter modal/bottom-sheet to the Search page for Price Range (Min/Max), Delivery Time, and Minimum Rating.
- **FR-011-06**: Advanced Search API: Update `ExecutorsController` and `ServicesController` to accept advanced filter query parameters.
- **FR-011-07**: UI/UX Consistency: Ensure all new screens (Project Posting, Bidding, Offers List) follow the modern glassmorphism and professional design established in previous updates.

### Key Entities *(include if data involved)*

- **ProjectRequest**: Represents a student's custom job posting (Title, Description, Budget, Deadline, Status: Open/Closed, IsPublic).
- **ProjectOffer**: Represents an executor's bid (ProjectRequestId, ExecutorId, ProposedPrice, ProposedDays, CoverLetter, Status: Pending/Accepted/Rejected).
- **ProjectInvitation**: Links a ProjectRequest to a specific Executor when a student sends a private invite.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-011-01**: Students can post a custom project and invite specific executors in under 2 minutes.
- **SC-011-02**: The system successfully converts 100% of accepted `ProjectOffers` into standard `Orders` without data loss.
- **SC-011-03**: Advanced filtering applies instantly (sub-300ms) on the frontend.
- **SC-011-04**: 20% of marketplace transactions originate from custom project bids within the first month.

## Assumptions

- **Payment System**: We assume the generated `Order` from a custom project will seamlessly integrate with the existing Payment and Escrow services.
- **Notifications**: We assume the existing SignalR/Notification service can be used to alert students when a new bid is placed or an executor is invited.

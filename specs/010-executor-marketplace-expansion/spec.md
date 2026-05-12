# Feature Specification: Executor Marketplace Expansion

**Feature Branch**: `010-executor-marketplace-expansion`  
**Created**: 2026-05-12  
**Status**: Draft  
**Input**: User description: "the excuter tabs that cloud in botom bar ples add it in side bar when user i excuter + improve side bar with modern style + add section in admin to aprove severce ofers from excuters + when serverce aprove make it active + make home page dynamic + when serch make result and fillter in serch page + add ability serch in excuters + chat with it + see portofoleios for excuters + add work galary for excuters + student can see it + use multiagents"

## User Scenarios & Testing *(mandatory)*

**Note**: Per Constitution Principle III, every user story MUST be verified with automated tests in both frontend and backend to ensure 100% functionality.

### User Story 1: Pro Executor Workspace (Priority: P1)

As an Executor, I want my specialized tools (orders, earnings) to be neatly organized in a modern sidebar so that my mobile workspace is optimized for professional use.

**Why this priority**: Core navigation hygiene and workspace separation.

**Acceptance Scenarios**:
1. **Given** I am logged in as an Executor, **When** I open the sidebar, **Then** I see "My Orders", "My Earnings", and "My Services" in a modern styled menu.
2. **Given** I am logged in as a Student, **When** I open the sidebar, **Then** I do NOT see executor-specific management tabs.

---

### User Story 2: Admin Service Arbitration (Priority: P1)

As an Admin, I want to review and approve new service offerings from executors so that I can maintain the quality and safety of the marketplace.

**Why this priority**: Critical for platform integrity and preventing spam/low-quality services.

**Acceptance Scenarios**:
1. **Given** a new service has been submitted by an executor, **When** I view the Admin "Pending Services" list, **Then** I can review the full details and media.
2. **Given** a pending service, **When** I click "Approve", **Then** the service status changes to "Active" and it immediately appears in public search results.

---

### User Story 3: Advanced Search & Discovery (Priority: P2)

As a student, I want to search for both services and executors with rich filtering options so that I can find the perfect professional for my specific academic needs.

**Why this priority**: High impact on user conversion and engagement.

**Acceptance Scenarios**:
1. **Given** I am on the Search page, **When** I type a keyword, **Then** I see matching services and executors in separate or mixed results.
2. **Given** a search result list, **When** I apply filters (Category, Price Range, Rating), **Then** the list updates instantly to show only matching items.

---

### User Story 4: Executor Portfolios & Work Gallery (Priority: P2)

As a Student, I want to see an executor's work gallery and portfolio before hiring them so that I can trust their expertise and quality.

**Why this priority**: Essential for building trust in a marketplace environment.

**Acceptance Scenarios**:
1. **Given** I am viewing an Executor's profile, **When** I scroll to the "Work Gallery" section, **Then** I see a high-quality grid of their past projects.
2. **Given** a gallery item, **When** I tap it, **Then** I see a full-screen view with project description and media.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-010-01**: Implement Role-Based Sidebar: Display executor management links only for accounts with the "Executor" role.
- **FR-010-02**: Modern Sidebar UI: Redesign sidebar with glassmorphism or modern flat design, including user stats and better icons.
- **FR-010-03**: Admin Approval Workflow: Dedicated dashboard in Admin panel for reviewing service drafts.
- FR-010-04: Dynamic Marketplace Home: Homepage content (featured, trending) will be recency-driven, prioritizing the newest services and recently active professionals.
- FR-010-05: Dedicated Search Page: Implement a tabbed toggle allowing users to switch between "Services" and "Pros (Executors)" results.
- FR-010-07: Work Gallery: A new "Gallery" entity linked to Executors allowing up to 10 image/video uploads of past work to ensure performance and quality.
- FR-010-08: Profile Direct Chat: Add a "Chat Now" button on every Executor profile and Portfolio item.

### Key Entities *(include if data involved)*

- **GalleryItem**: Represents a single work in an executor's portfolio (Title, Description, MediaUrl, CreatedAt).
- **ServiceApprovalLog**: Track who approved/rejected a service and when.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-010-01**: 100% of approved services are searchable within 1 second of Admin action.
- **SC-010-02**: Search result filtering responds in under 300ms on standard mobile connections.
- **SC-010-03**: Executor profiles with work galleries see a 30% higher "Chat Initiation" rate compared to those without.
- **SC-010-04**: Zero executor management tabs visible to non-executor users.

## Assumptions

- **Admin Panel**: We assume the existing Admin area is capable of hosting a new "Service Approvals" list.
- **Media Hosting**: We assume the existing `IFileService` supports multi-file uploads for galleries.
- **Chat System**: We assume the existing SignalR chat infrastructure can handle direct initiation from profiles.


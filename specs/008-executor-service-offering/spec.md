# Feature Specification: Executor Service Offering

**Feature Branch**: `008-executor-service-offering`  
**Created**: 2026-05-12  
**Status**: Draft  
**Input**: User description: "add ability to excuter offer his sevces"

## Clarifications

### Session 2026-05-12
- Q: Should services include an expected delivery timeframe? → A: Yes, add "Estimated Delivery" in days as a required field.
- Q: Should executors specify the number of revisions included? → A: Yes, add "Included Revisions" as an integer field.
- Q: Should services support searchable tags or keywords? → A: Yes, allow executors to add up to 5 tags/keywords for better searchability.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Publish Service (Priority: P1)

As an Executor, I want to create a new service offering so that students can find and purchase my skills.

**Why this priority**: Core functionality needed to enable the marketplace model.

**Independent Test**: An executor can fill out the service creation form, upload an image, and see the service listed in their profile and the public catalog.

**Acceptance Scenarios**:

1. **Given** I am logged in as an Executor, **When** I navigate to "My Services" and click "Add Service", **Then** I am presented with a form to enter title, description, category, price, delivery days, revisions, and tags.
2. **Given** I have filled out the service form, **When** I click "Publish", **Then** the service is saved and becomes visible to potential buyers.

---

### User Story 2 - Manage Existing Services (Priority: P2)

As an Executor, I want to edit or pause my service offerings so that I can keep my availability and terms up to date.

**Why this priority**: Necessary for ongoing platform utility as service details change.

**Independent Test**: An executor can update the price of a service and verify that the new price is reflected immediately in the catalog.

**Acceptance Scenarios**:

1. **Given** I have an active service, **When** I change the price or description, **Then** the updates are reflected in the public view.
2. **Given** I am busy, **When** I set a service to "Paused", **Then** it is no longer visible in the public catalog but remains in my management dashboard.

---

### User Story 3 - Service Image Management (Priority: P2)

As an Executor, I want to upload a cover image for my service so that it looks professional and attracts more interest.

**Why this priority**: Visuals are critical for marketplace conversion rates.

**Independent Test**: Upload a JPG image and verify it renders correctly on the service detail page.

**Acceptance Scenarios**:

1. **Given** I am creating/editing a service, **When** I select an image from my device, **Then** it is uploaded and associated with that specific service.

### Edge Cases

- **What happens when an Executor tries to publish a service without a price?**: The system should prevent submission and highlight the price field as mandatory.
- **How does system handle very long service titles?**: Titles should be truncated or wrapped in the UI to prevent layout breakage, with a character limit enforced at the data level.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow Executors to create services with a Title (max 100 chars), Description (rich text), Category, Base Price, Estimated Delivery (in days), Included Revisions, and up to 5 Tags.
- **FR-002**: System MUST support "Draft", "Pending Approval", "Active", and "Paused" statuses for each service.
- **FR-003**: System MUST allow Executors to upload at least one primary image for the service.
- **FR-004**: System MUST validate that the price, delivery days, and revisions are non-negative numeric values.
- **FR-005**: Services MUST be reviewed and approved by an Admin before changing status from "Pending Approval" to "Active".

### Key Entities *(include if feature involves data)*

- **ServiceOffering**: Represents a specific skill or task offered by an Executor. Includes attributes like Title, Description, Price, DeliveryDays, Revisions, Status, Tags, and CategoryId.
- **ServiceCategory**: Predefined groups for services (e.g., Programming, Writing, Design).
- **ServiceImage**: Metadata for images associated with a ServiceOffering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Executors can complete the "Create Service" flow in under 90 seconds.
- **SC-002**: 100% of published services are searchable in the catalog within 5 seconds of activation.
- **SC-003**: Service detail pages load in under 1 second on standard mobile connections.
- **SC-004**: System successfully rejects 100% of service submissions that lack mandatory fields (Title, Price).

## Assumptions

- **Existing Auth**: We assume the current User model distinguishes between "Students" and "Executors".
- **Category Data**: We assume a set of Service Categories already exists in the database.
- **Media Storage**: We assume an existing file upload and storage service (e.g., S3 or local disk) is available.

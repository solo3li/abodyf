# Feature Specification: User Profile & Favourites

**Feature Branch**: `006-profile-and-favourites`  
**Created**: 2026-05-11  
**Status**: Draft  
**Input**: User description: "add favourites page + edit user page + add ability change your profile pic"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bookmark Services (Priority: P1)

As a Student, I want to bookmark services that interest me, so that I can easily find and order them later without searching again.

**Why this priority**: Core utility for users to manage their service discovery.

**Independent Test**: User can click a "Favourite" (heart) icon on a service card. The icon state changes to "filled". Navigating away and back shows the service still marked as favourite.

**Acceptance Scenarios**:
1. **Given** an authenticated user browsing services, **When** they click the "Favourite" icon on a service, **Then** the service should be added to their personal favourites list.
2. **Given** a service already in the favourites list, **When** the user clicks the "Unfavourite" icon, **Then** the service should be removed from the list.

---

### User Story 2 - Favourites List (Priority: P1)

As a User, I want a dedicated page to view all my bookmarked services, so that I can manage my saved items in one place.

**Why this priority**: Essential for the bookmarks to be useful.

**Independent Test**: Navigating to the "Favourites" tab/page displays a grid or list of all services previously bookmarked by the user.

**Acceptance Scenarios**:
1. **Given** a user has bookmarked multiple services, **When** they open the Favourites page, **Then** they should see all bookmarked services.
2. **Given** the Favourites page, **When** a user clicks on a service card, **Then** they should be taken to that service's details page.

---

### User Story 3 - Edit Profile Information (Priority: P2)

As a User, I want to update my personal details like name, bio, and university, so that my profile remains accurate and professional.

**Why this priority**: Important for trust between students and executors.

**Independent Test**: user navigates to "Edit Profile", changes their "Bio", and saves. Upon refreshing or revisiting the profile, the new Bio is displayed.

**Acceptance Scenarios**:
1. **Given** an authenticated user on the Edit Profile page, **When** they modify their Full Name, University, Major, or Bio and click "Save", **Then** the system should update their record and display the changes.

---

### User Story 4 - Update Profile Picture (Priority: P2)

As a User, I want to upload a custom profile picture, so that I can personalize my account and be easily recognized by others.

**Why this priority**: High visual impact and personalization.

**Independent Test**: User selects an image from their device, uploads it, and sees it reflected in the app header and profile section.

**Acceptance Scenarios**:
1. **Given** the Edit Profile screen, **When** the user chooses an image and confirms the upload, **Then** the system should replace their current profile picture with the new one.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to toggle "Favourite" status on any active service.
- **FR-002**: The system MUST provide a secure endpoint to retrieve the list of services bookmarked by the current user.
- **FR-003**: The user interface MUST provide a dedicated "Favourites" view accessible from the main navigation.
- **FR-004**: The system MUST allow users to update their `FullName`, `University`, `Major`, and `Bio`.
- **FR-005**: The system MUST support uploading image files for profile pictures.
- **FR-006**: Profile picture updates MUST be reflected across all application components (Chat, Service Provider info, etc.).
- **FR-007**: Validation MUST ensure that name and university fields are not empty during profile updates.

### Key Entities *(include if feature involves data)*

- **Favorite**: Links a `User` to a `Service`. Attributes: UserID, ServiceId, CreatedAt.
- **User**: Updated attributes: ProfilePicture (URL), FullName, University, Major, Bio.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Favourites page loads in under 500ms for a user with up to 50 saved items.
- **SC-002**: Profile update operations (textual) complete in under 1 second.
- **SC-003**: 100% of uploaded profile pictures are correctly displayed in the User Profile and Chat interfaces.
- **SC-004**: Users can add/remove a favourite with a single interaction (click/tap).

## Assumptions

- **Storage**: The system will utilize the existing local file storage or cloud storage provider for profile pictures.
- **Access**: Favourites and Profile Editing are only available to authenticated users.
- **Mobile Native**: Image picking will utilize native device gallery/camera permissions.

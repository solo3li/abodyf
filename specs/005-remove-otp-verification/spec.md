# Feature Specification: Remove OTP Verification

**Feature Branch**: `005-remove-otp-verification`  
**Created**: 2026-05-11  
**Status**: Draft  
**Input**: User description: "remove otp verfication"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Direct Login (Priority: P1)

As a Student or Executor, I want to log in to the application using my email and password and gain immediate access, so that I don't have to wait for an email or enter a secondary code.

**Why this priority**: This is the core authentication flow. Removing the friction of OTP significantly improves the user experience and speed of access.

**Independent Test**: Can be tested by entering valid credentials on the login screen and verifying that the user is immediately redirected to the dashboard/home screen without seeing an OTP input field.

**Acceptance Scenarios**:

1. **Given** a registered user exists with a known email and password, **When** they enter their credentials and click "Login", **Then** they should be immediately authenticated and redirected to the application home screen.
2. **Given** an unauthenticated user, **When** they attempt to login with incorrect credentials, **Then** they should see an error message and remain on the login screen.

---

### User Story 2 - Direct Registration (Priority: P2)

As a new user, I want my account to be active and accessible immediately after I sign up, so that I can start using the platform's services right away.

**Why this priority**: Ensures a smooth onboarding experience for new users.

**Independent Test**: Can be tested by completing the registration form and verifying that the user is logged in and redirected to the home screen immediately upon submission.

**Acceptance Scenarios**:

1. **Given** a new user provides valid registration details, **When** they click "Register", **Then** their account should be created and they should be logged in immediately.

---

### Edge Cases

- **What happens when a user attempts to access the old verify-otp route?**: The system should redirect them to the login or home screen depending on their authentication status.
- **How does the system handle legacy users who were mid-verification?**: These users should be able to log in directly using their password; any pending OTPs should be ignored.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate users using Email and Password only for the primary login flow.
- **FR-002**: The authentication service MUST return a valid security token and user details immediately upon successful credential validation.
- **FR-003**: The system MUST NOT trigger or send any secondary verification codes (such as OTP) during the login or registration process.
- **FR-004**: The application interface MUST remove or bypass any secondary verification entry screens in the authentication flow.
- **FR-005**: New user accounts MUST be created with an "Active" status immediately upon successful registration.

### Key Entities *(include if feature involves data)*

- **User**: Represents the platform participant (Student/Executor). Key attributes: Email, Password, Active Status.
- **Verification Code**: This entity and its associated data become obsolete for the primary authentication flow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the login process in under 3 seconds from the moment they click "Login".
- **SC-002**: 100% of successful authentication attempts lead directly to the application home screen without intermediate verification steps.
- **SC-003**: Zero secondary verification messages (such as OTP emails) are dispatched by the system during standard user authentication sessions.

## Assumptions

- **Existing Password Infrastructure**: It is assumed that the system already has a functional password-based authentication mechanism as a fallback or parallel to the OTP logic (confirmed by `PasswordHash` in `Users` table).
- **Security Policy**: It is assumed that removing MFA (OTP) is an intentional business decision and that the security risks are accepted for the sake of user convenience.
- **Backend Availability**: The `verify-otp` endpoint will remain available but unused by the frontend, or will be deprecated in a future cleanup.

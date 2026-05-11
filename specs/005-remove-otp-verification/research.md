# Research: Remove OTP Verification

## Decision: 1. Backend Authentication Bypass
- **Chosen**: Modify `AuthController.Login` to return the JWT token and user details immediately.
- **Rationale**: This fulfills the primary requirement of removing the OTP step. By returning everything in the login response, the frontend can bypass the verification screen.
- **Alternatives Considered**: 
    - Keep login as is and have `VerifyOtp` accept any code. (Rejected: still requires user interaction).
    - Use a "magic link" approach. (Rejected: unnecessary complexity for this requirement).

## Decision: 2. Auto-Activation on Registration
- **Chosen**: Update `AuthController.Register` to return an authenticated session (Token + User) immediately.
- **Rationale**: Ensures immediate access for new users, improving onboarding flow as per clarification.
- **Alternatives Considered**: 
    - Keep registration separate and require login. (Rejected: adds an extra step).

## Decision: 3. Backward Compatibility for `VerifyOtp`
- **Chosen**: The `verify-otp` endpoint will be modified to return a success response with user details immediately if the user exists, or return a "Verification Not Required" message.
- **Rationale**: Prevents breaking old mobile clients that might still attempt to call this endpoint.
- **Alternatives Considered**: 
    - Remove endpoint. (Rejected: high risk of breaking unupdated clients).

## Decision: 4. Frontend Navigation Update
- **Chosen**: Update the `login` and `register` screens in the Expo app to navigate directly to the application tabs upon success.
- **Rationale**: Aligns the UI with the new authentication flow.

## Decision: 5. Legacy Data Cleanup (Hard Reset)
- **Chosen**: Clear the `EmailOtps` table.
- **Rationale**: Simple way to implement the "Hard Reset" decision from the clarification session.

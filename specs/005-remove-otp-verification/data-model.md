# Data Model: Remove OTP Verification

## Entities

### User (Existing)
- **Status**: Updated
- **Fields**:
    - `IsActive`: Now defaults to `true` (previously might have been `false` until OTP).
- **Validation**: No changes to existing validations.

### EmailOtp (Existing)
- **Status**: Legacy / Obsolete
- **Notes**: This table will no longer be used for the primary authentication flow. Existing records will be cleared as part of the implementation.

## State Transitions

### User Registration
- **Previous**: `Registration` -> `Pending Verification (OTP)` -> `Active`
- **New**: `Registration` -> `Active` (Immediate)

### User Login
- **Previous**: `Login Credentials` -> `OTP Challenge` -> `Authenticated`
- **New**: `Login Credentials` -> `Authenticated` (Immediate)

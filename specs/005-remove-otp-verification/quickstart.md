# Quickstart: Remove OTP Verification

## Overview
This feature removes the secondary OTP verification step from the login and registration flows in the UIS application.

## Prerequisites
- Backend (ASP.NET Core) running.
- Frontend (Expo) running.

## Verification Steps

### 1. Test Login
1. Open the UIS app.
2. Go to the Login screen.
3. Enter registered credentials.
4. Verify that you are redirected to the Home screen immediately.
5. Check that no OTP email was received.

### 2. Test Registration
1. Go to the Sign Up screen.
2. Enter new user details.
3. Submit the form.
4. Verify that the account is created and you are redirected to the Home screen immediately.

### 3. Test Backward Compatibility
1. Manually call the `POST /api/Auth/verify-otp` endpoint using a tool like `curl` or Postman.
2. Verify it returns a successful response even with dummy or no data.

# Implementation Plan: Remove OTP Verification

**Branch**: `005-remove-otp-verification` | **Date**: 2026-05-11 | **Spec**: [specs/005-remove-otp-verification/spec.md](spec.md)
**Input**: Feature specification from `/specs/005-remove-otp-verification/spec.md`

## Summary
Remove the Email OTP verification step from both Login and Registration flows to provide immediate access to the application. This involves backend changes to return authentication tokens directly and frontend changes to bypass the OTP screen.

## Technical Context

**Language/Version**: ASP.NET Core 10.0, TypeScript/Expo SDK 54
**Primary Dependencies**: Entity Framework Core, SignalR, Redux Toolkit
**Storage**: PostgreSQL
**Testing**: xUnit (Backend), Jest (Frontend)
**Target Platform**: Linux (Server), Android/iOS (Mobile)
**Project Type**: Web API + Mobile App
**Performance Goals**: Login completion in < 3 seconds
**Constraints**: Zero OTP emails sent, bypass verification screens, backward compatible API.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monolith First**: PASS (Backend is a single ASP.NET Core project)
- **Single Role-Based App**: PASS (Frontend is a unified Expo app)
- **Security (JWT)**: PASS (Still using JWT for auth)

## Project Structure

### Documentation (this feature)

```text
specs/005-remove-otp-verification/
├── plan.md              # This file
├── research.md          # Decision log
├── data-model.md        # Entity and state transition changes
├── quickstart.md        # Manual verification steps
├── contracts/           # API contract updates
└── tasks.md             # Implementation tasks (Phase 2)
```

### Source Code (repository root)

```text
msa3ed/
├── server/
│   ├── Controllers/Api/AuthController.cs (within ApiControllers.cs)
│   ├── Services/CoreServices.cs (AuthService, OtpService)
│   └── Data/ApplicationDbContext.cs
└── UIS/
    ├── app/(auth)/
    │   ├── login.tsx
    │   ├── register.tsx
    │   └── otp-verify.tsx
    └── store/slices/authSlice.ts
```

**Structure Decision**: Standard Backend (ASP.NET) + Frontend (Expo) layout within the `msa3ed` directory.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |

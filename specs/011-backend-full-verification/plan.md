# Implementation Plan: backend-full-verification

**Branch**: `011-backend-full-verification` | **Date**: 2026-05-14 | **Spec**: [specs/011-backend-full-verification/spec.md](specs/011-backend-full-verification/spec.md)
**Input**: Feature specification from `/specs/011-backend-full-verification/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature performs a full verification and audit of the UIS backend API to ensure production readiness. The technical approach involves implementing a comprehensive test suite (contract, integration, and load tests), removing OTP verification in favor of direct JWT auth, enforcing rate limiting, and enabling structured JSON logging. All core marketplace features (Auth, Services, Orders, Wallet, Chat, Support) will be validated against a target load of 1,000 concurrent users.

## Technical Context

**Language/Version**: C# 12 / .NET 10.0  
**Primary Dependencies**: EF Core 10, SignalR, MailKit, FFMpegCore, Serilog (for JSON logging)  
**Storage**: PostgreSQL  
**Testing**: xUnit (Backend)  
**Target Platform**: Linux server (Ubuntu)
**Project Type**: Web API  
**Performance Goals**: <500ms p95 for API responses; real-time messaging latency <200ms  
**Constraints**: 100 req/min rate limit per IP; 20MB upload limit; Indefinite data retention  
**Scale/Scope**: 1,000 concurrent users / 10,000 daily orders

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Service-First Architecture**: Is backend logic encapsulated in services? (Yes: existing Auth, Wallet, Chat, and Order services will be audited)
- [x] **II. Test-First Development**: Are xUnit tests planned for all audit checks? (Yes: new integration and contract tests will be added to Uis.Tests)
- [x] **III. Real-Time & Async Contract Stability**: Are SignalR Hub methods documented? (Yes: in contracts/)
- [x] **IV. Security & Identity at Every Layer**: Are all endpoints protected? (Yes: JWT auth remains; OTP removal is documented as a violation)
- [x] **V. Observability & Structured Diagnostics**: Is structured JSON logging used? (Yes: required by spec FR-009)
- [x] **Technology Stack Constraints**: Are we using .NET 10.0, EF Core 10, and SignalR? (Yes)

## Project Structure

### Documentation (this feature)

```text
specs/011-backend-full-verification/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
msa3ed/
└── server/              # ASP.NET Core Backend
    ├── Controllers/Api/ # Web API Endpoints
    ├── Services/        # Business Logic (Chat, Wallet, Order)
    ├── Hubs/            # SignalR Hubs
    ├── Data/            # DB Context & Seeder
    └── Middleware/      # Rate Limiting & Logging
```

**Structure Decision**: Standard ASP.NET Core Web API structure within `msa3ed/server/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Removal of Email OTP | Explicit user request for simplified testing and faster onboarding during verification phase. | Keeping OTP would require live mailer setup or mocking which the user explicitly bypassed ("no use otp"). |


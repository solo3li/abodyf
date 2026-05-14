# Implementation Plan: fix-api-signalr-errors

**Branch**: `007-advanced-chat-system` | **Date**: 2026-05-13 | **Spec**: [specs/010-fix-api-errors/spec.md](specs/010-fix-api-errors/spec.md)
**Input**: Feature specification from `/specs/010-fix-api-errors/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature addresses several API and SignalR connectivity issues reported in the UIS backend. The primary goals are to resolve a 500 error in the Chat Inbox, fix 404 errors for Wallet and Order Acceptance endpoints, and troubleshoot SignalR negotiation failures. The technical approach involves refactoring LINQ queries for SQL translation, verifying route mappings, and adjusting CORS/SignalR configuration for public IP access.

## Technical Context

**Language/Version**: C# 12 / .NET 10.0  
**Primary Dependencies**: EF Core 10, SignalR, MailKit, FFMpegCore  
**Storage**: PostgreSQL  
**Testing**: xUnit (Backend), Jest (Frontend)  
**Target Platform**: Linux server (209.38.238.175), Expo (Mobile)
**Project Type**: Web API + MVC Admin + Mobile App  
**Performance Goals**: <500ms p95 for API responses; real-time messaging latency <200ms  
**Constraints**: 20MB upload limit, RTL layout required, JWT auth (24h)  
**Scale/Scope**: Marketplace platform for university services (Students/Executors)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Service-First Architecture**: Is backend logic encapsulated in services? (Yes: WalletService, ChatService, OrderService)
- [x] **II. Test-First Development**: Are xUnit tests planned for API fixes? (Yes: contract and integration tests)
- [x] **III. Real-Time & Async Contract Stability**: Are SignalR Hub methods documented in contracts/? (Yes)
- [x] **IV. Security & Identity at Every Layer**: Are all endpoints protected by `[Authorize]`? (Yes)
- [x] **V. Observability & Structured Diagnostics**: Is structured logging used for I/O boundaries? (Yes)
- [x] **Technology Stack Constraints**: Are we using .NET 10.0, EF Core 10, SignalR, and Expo 54? (Yes)

## Project Structure

### Documentation (this feature)

```text
specs/010-fix-api-errors/
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
├── server/              # ASP.NET Core Backend
│   ├── Controllers/Api/ # Web API Endpoints
│   ├── Services/        # Business Logic (Chat, Wallet, Order)
│   ├── Hubs/            # SignalR Hubs
│   └── Data/            # DB Context & Seeder
└── UIS/                 # Expo Mobile Frontend
    ├── app/             # Screens & Routing
    ├── components/      # Shared UI
    └── store/           # Redux Toolkit Slices
```

**Structure Decision**: Hybrid Mobile + API structure. Backend logic resides in `msa3ed/server/`, frontend in `msa3ed/UIS/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

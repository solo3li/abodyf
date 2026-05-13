# Implementation Plan: Platform Polish, Wallet & Full Admin Control

**Branch**: `008-platform-polish-wallet-admin` | **Date**: 2026-05-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-platform-polish-wallet-admin/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature unifies the visual language of the mobile application (matching LTR/RTL styles, standardizing components, removing redundant pages) and implements a fully integrated internal wallet system for order funding. In parallel, it significantly expands the MVC Admin Panel to cover all system entities (Wallet, Audit Logs, fully functional CRUD and Status overrides), ensuring end-to-end frontend/backend connectivity and robust error handling.

## Technical Context

**Language/Version**: C# 10 (ASP.NET Core), TypeScript (React Native/Expo SDK 54)  
**Primary Dependencies**: EF Core 10, SignalR, Redux Toolkit, expo-linear-gradient  
**Storage**: PostgreSQL (RDS/Local)  
**Testing**: xUnit (Backend), Jest (Frontend)  
**Target Platform**: iOS, Android, Web (Admin)  
**Project Type**: Web API + Mobile App + MVC Admin Panel  
**Performance Goals**: Sub-second UI updates for searches, atomic wallet transactions  
**Constraints**: 10,000 EGP per-transaction top-up limit, 20MB file upload limit  
**Scale/Scope**: Impacts all major views, adds core financial logic to Orders/Payments  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I: Service-First Architecture** - Wallet logic and Audit Logging will be built as dedicated injectable services (`IWalletService`, `IAuditLogService`), not inlined in controllers.
- [x] **Principle II: Test-First Development** - Wallet ledger operations require unit tests to verify atomic deductions before the controller endpoints are wired.
- [x] **Principle III: Real-Time & Async Contract Stability** - No breaking changes to existing hubs, but async operations (top-up) will use structured responses.
- [x] **Principle IV: Security & Identity at Every Layer** - `[Authorize]` attributes added to `AdminController`, and Wallet DB updates wrapped in transactions.
- [x] **Principle V: Observability & Structured Diagnostics** - Audit logging introduced for all critical Admin actions and wallet adjustments.

## Project Structure

### Documentation (this feature)

```text
specs/008-platform-polish-wallet-admin/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API definitions)
└── tasks.md             # Phase 2 output (via /speckit-tasks)
```

### Source Code (repository root)

```text
msa3ed/server/
├── Controllers/
│   ├── AdminController.cs         # Extended with Wallet/Audit/Settings
│   └── Api/
│       ├── WalletController.cs    # NEW: Wallet endpoints
│       └── OrdersController.cs    # MODIFIED: Payment integration
├── Services/
│   ├── IWalletService.cs          # NEW: Atomic ledger operations
│   └── IAuditLogService.cs        # NEW: Action tracking
├── Models/
│   └── AppModels.cs               # MODIFIED: Wallet, Transactions, Audit entities
└── Views/
    └── Admin/                     # Extended with new management views

msa3ed/UIS/
├── app/
│   ├── student/
│   │   ├── (tabs)/index.tsx       # MODIFIED: Redesign + Wallet Card
│   │   └── wallet/index.tsx       # NEW: Wallet internal page
│   └── Admin/Notifications.tsx    # DELETED: Moved to web
├── components/
│   └── WalletCard.tsx             # NEW: Reusable balance component
├── store/slices/
│   └── walletSlice.ts             # NEW: Redux state for wallet
└── constants/
    └── Colors.ts                  # MODIFIED: Unified tokens
```

**Structure Decision**: Hybrid Monolith. Backend logic resides in `msa3ed/server` (Web API + Services), and Frontend logic in `msa3ed/UIS` (React Native/Expo).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |

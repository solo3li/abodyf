# Implementation Plan: uis-full-integration

**Branch**: `015-uis-full-integration` | **Date**: 2026-05-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/015-uis-full-integration/spec.md`

## Summary
The "uis-full-integration" feature focuses on connecting the marketplace UI (Web Admin and Mobile) with the backend financial and moderation features. This includes building administrative dashboards for deposits, withdrawals, and disputes, as well as student-facing wallet and review interfaces. The approach follows **Principle I (Service-First Architecture)** by leveraging the newly created services and **Principle IV (Security)** by ensuring all financial resolutions are audit-logged.

## Technical Context

**Language/Version**: C# / .NET 10.0, TypeScript / React Native (Expo 54)
**Primary Dependencies**: ASP.NET Core, EF Core 10, SignalR, Serilog, Redux Toolkit
**Storage**: PostgreSQL
**Testing**: xUnit (Backend), Jest (Frontend)
**Target Platform**: Linux Server / Docker / iOS & Android
**Project Type**: Full-Stack Web + Mobile
**Performance Goals**: < 500ms p95 for dashboard lists, Real-time balance updates via SignalR
**Constraints**: RTL compliance for Arabic (Principle V), Manual screenshot verification for payouts
**Scale/Scope**: 1,000 concurrent users, 5 new admin pages, 2 new mobile screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] **I. Service-First Architecture**: Ensure all logic is in `IDepositService`, `IWithdrawalService`, etc. No logic in `AdminController`.
- [ ] **II. Test-First Development**: xUnit tests for service methods and Jest tests for wallet Redux slices MUST precede UI work.
- [ ] **III. Real-Time & Async Contract Stability**: SignalR contracts for deposit/withdrawal notifications MUST be defined in `contracts/`.
- [ ] **II. Security & Identity at Every Layer**: `[Authorize]` on all resolution endpoints. Mandatory `IAuditLogService` calls for every resolved request.
- [ ] **V. Observability & Structured Diagnostics**: Structured logging for all financial state transitions (Pending → Approved/Rejected).

## Project Structure

### Documentation (this feature)

```text
specs/015-uis-full-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
msa3ed/server/
├── Controllers/
│   ├── AdminController.cs      # Add Deposit/Withdrawal/Dispute views
│   └── Api/
│       ├── WalletController.cs # Add SignalR notifications
│       └── ReviewsController.cs
├── Views/Admin/
│   ├── Deposits.cshtml         # NEW
│   ├── Withdrawals.cshtml      # NEW
│   └── Disputes.cshtml         # NEW
└── Services/                   # Already exists (IDepositService etc.)

msa3ed/mobile/
├── src/
│   ├── screens/
│   │   ├── WalletScreen.tsx    # NEW
│   │   └── ReviewModal.tsx     # NEW
│   └── store/
│       └── walletSlice.ts      # NEW
```

**Structure Decision**: Standard Full-Stack structure. Admin pages added to MVC project (`msa3ed/server`), Mobile features added to Expo project (`msa3ed/mobile`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

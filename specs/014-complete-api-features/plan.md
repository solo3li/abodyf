# Implementation Plan: complete-api-features

**Branch**: `014-complete-api-features` | **Date**: 2026-05-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/014-complete-api-features/spec.md`

## Summary
The "complete-api-features" feature aims to finalize the marketplace lifecycle by adding withdrawals, reviews, disputes, and administrative analytics. The technical approach involves creating dedicated service layers (`WithdrawalService`, `ReviewService`, `DisputeService`) following the **Service-First Architecture** (Principle I), using manual screenshot verification for payouts, and implementing denormalized rating aggregations for performance (SC-002).

## Technical Context

**Language/Version**: C# / .NET 10.0
**Primary Dependencies**: ASP.NET Core, EF Core 10, SignalR, Serilog
**Storage**: PostgreSQL
**Testing**: xUnit (Test-First)
**Target Platform**: Linux Server / Docker
**Project Type**: Web API
**Performance Goals**: < 500ms p95, SC-004 Dashboard < 500ms for 10k orders
**Constraints**: Manual screenshot verification for withdrawals, mandatory evidence for disputes
**Scale/Scope**: 1,000 concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Service-First Architecture**: Features are encapsulated in `IWithdrawalService`, `IReviewService`, etc.
- [x] **II. Test-First Development**: xUnit tests will be created for each service and endpoint.
- [x] **III. Real-Time Stability**: No breaking SignalR changes; uses existing `NotificationHub`.
- [x] **IV. Security & Identity**: All new endpoints marked `[Authorize]`. Admin actions logged via `IAuditLogService`.
- [x] **V. Observability**: `ILogger` used for financial and dispute transitions.

## Project Structure

### Documentation (this feature)

```text
specs/014-complete-api-features/
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
├── Controllers/Api/
│   ├── WalletController.cs     # Add Withdrawal endpoints
│   ├── ReviewsController.cs    # NEW
│   ├── OrdersController.cs     # Add Dispute endpoints
│   └── AdminController.cs      # NEW (Stats & Settings)
├── Services/
│   ├── WalletService.cs        # Implement IWithdrawalService
│   ├── ReviewService.cs        # NEW
│   └── DisputeService.cs       # NEW
├── Models/
│   └── AppModels.cs            # Update with new entities
└── Data/
    └── ApplicationDbContext.cs # Add DbSet for new entities

msa3ed/Uis.Tests/
├── WithdrawalTests.cs          # NEW
├── ReviewTests.cs              # NEW
└── DisputeTests.cs             # NEW
```

**Structure Decision**: Standard ASP.NET Core project structure (Option 1). New services will be added to `msa3ed/server/Services/` and controllers to `msa3ed/server/Controllers/Api/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Denormalized Ratings | Performance SC-002 | Real-time calculation on 10k+ rows is too slow for 1k users |

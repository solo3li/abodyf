# Execution Tasks: Platform Polish, Wallet & Full Admin Control

**Feature**: 008-platform-polish-wallet-admin
**Date**: 2026-05-13

## Phase 1: Setup & Foundations
**Goal**: Prepare the database and foundational services for the new features.
**Test**: The backend compiles, migrations are applied successfully, and services are injected.

- [x] T001 Update `User` model with `WalletBalance`, add `WalletTransaction` and `AuditLog` entities, and update `SystemSetting` keys in `msa3ed/server/Models/AppModels.cs` and `msa3ed/server/Data/ApplicationDbContext.cs`.
- [x] T002 Generate EF Core migration `AddWalletAndAuditLog` and apply it to the database in `msa3ed/server`.
- [x] T003 Create `IWalletService` and `WalletService` with atomic ledger methods in `msa3ed/server/Services/WalletService.cs`.
- [x] T004 Create `IAuditLogService` and `AuditLogService` in `msa3ed/server/Services/AuditLogService.cs`.
- [x] T005 Register `IWalletService` and `IAuditLogService` in `msa3ed/server/Program.cs`.

## Phase 2: Internal Wallet (US2)
**Goal**: Implement the wallet backbone for holding balances, topping up, and processing order payments.
**Test**: Student can view balance, add funds (top-up), and place an order using wallet funds.

- [x] T006 [P] [US2] Implement `WalletController` (`GET /api/Wallet`, `POST /api/Wallet/TopUp`) in `msa3ed/server/Controllers/Api/WalletController.cs`.
- [x] T007 [US2] Update order creation in `msa3ed/server/Controllers/Api/OrdersController.cs` to deduct from `WalletBalance` atomatically, preventing order creation if insufficient funds.
- [x] T008 [P] [US2] Create Redux state slice for wallet in `msa3ed/UIS/store/slices/walletSlice.ts` and add it to `store/index.ts`.
- [x] T009 [US2] Create the frontend Wallet screen UI with top-up and transaction history in `msa3ed/UIS/app/student/(tabs)/wallet/index.tsx`.
- [x] T010 [US2] Update `profile.tsx` to display real wallet balance and navigate to the wallet screen in `msa3ed/UIS/app/student/(tabs)/profile.tsx`.

## Phase 3: Redesigned Home Page (US1)
**Goal**: Polish the Home page design and integrate the Wallet Summary Card.
**Test**: Launch app as student, see matching UI tokens, and see real-time wallet balance at the top of Home.

- [x] T011 [P] [US1] Create a reusable `WalletCard` component in `msa3ed/UIS/components/WalletCard.tsx`.
- [x] T012 [US1] Refactor Home page layout, styles, and incorporate `WalletCard` in `msa3ed/UIS/app/student/(tabs)/index.tsx`.

## Phase 4: Full Admin Panel Control (US3)
**Goal**: Secure the admin panel and add complete control for Wallet and Audit logs.
**Test**: Visit `/Admin`, verify it requires Admin auth. Manually credit a user's wallet and see the log appear in Audit Logs.

- [x] T013 [P] [US3] Add `[Authorize]` attribute with Admin-only check to `msa3ed/server/Controllers/AdminController.cs`.
- [x] T014 [US3] Implement Wallet management actions (List, Details, Credit, Debit) in `msa3ed/server/Controllers/AdminController.cs`.
- [x] T015 [US3] Create Wallet admin views in `msa3ed/server/Views/Admin/WalletList.cshtml` and `WalletDetails.cshtml`.
- [x] T016 [US3] Implement Audit Log view action in `msa3ed/server/Controllers/AdminController.cs` and create `msa3ed/server/Views/Admin/AuditLogs.cshtml`.
- [x] T017 [US3] Inject `IAuditLogService` into `AdminController` and log critical actions (User toggle, KYC approve, etc.) in `msa3ed/server/Controllers/AdminController.cs`.
- [x] T018 [US3] Update System Settings admin views to manage Commission Rate, Max Top Up, and Platform Name in `msa3ed/server/Controllers/AdminController.cs` and `Views/Admin/Settings.cshtml`.

## Phase 5: Full Frontend-Backend Integration (US4)
**Goal**: Wire up disconnected features (Search, Order Acceptance, Escrow Release).
**Test**: Search filters properly. Executor can accept a pending order. Completing an order releases escrow to executor's wallet.

- [x] T019 [P] [US4] Implement `POST /api/Orders/{id}/Accept` and `POST /api/Orders/{id}/Complete` (triggering escrow release) in `msa3ed/server/Controllers/Api/OrdersController.cs`.
- [x] T020 [P] [US4] Update `ServicesController` to handle `search` and `categoryId` query parameters in `msa3ed/server/Controllers/Api/ApiControllers.cs`.
- [x] T021 [US4] Implement debounced search backend call on the Home screen search bar in `msa3ed/UIS/app/student/(tabs)/index.tsx`.
- [x] T022 [US4] Add frontend actions and UI buttons for Executors to Accept and Complete orders in `msa3ed/UIS/app/student/(tabs)/executor-orders.tsx` (or related order details view).

## Phase 6: Design Consistency & Cleanup (US5)
**Goal**: Unify design tokens, apply RTL fixes, and remove dead pages.
**Test**: Mobile app has no crashes, consistent radii, and no unreachable/wrongly-routed tabs.

- [x] T023 [P] [US5] Consolidate design tokens (wallet colors, card radius) in `msa3ed/UIS/constants/Colors.ts`.
- [x] T024 [P] [US5] Delete mobile `msa3ed/UIS/app/Admin/Notifications.tsx` completely.
- [x] T025 [US5] Remove `categories.tsx` from bottom tabs in `msa3ed/UIS/app/student/(tabs)/_layout.tsx` (if it was standalone).
- [x] T026 [US5] Final RTL visual pass: fix any misaligned text alignments or icons across Home and Profile views.

---

## Dependencies

- **Phase 1** must be completed first (Schema changes).
- **Phase 2 (Wallet)** must precede **Phase 3 (Home Page)** because the Home Page depends on the Wallet Redux state and API.
- **Phase 4 (Admin)** and **Phase 5 (Integration)** can be developed in parallel with Phase 2/3.
- **Phase 6 (Polish)** must be done last to ensure all new components receive the final design tokens.

## Implementation Strategy

**MVP Scope**: Phases 1, 2, and 3. This establishes the financial backbone and updates the primary user entry point (Home).
Once MVP is merged, the backend Admin expansion (Phase 4) and integration fixes (Phase 5) will harden the platform.

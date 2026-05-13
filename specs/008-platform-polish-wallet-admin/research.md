# Research: Platform Polish, Wallet & Full Admin Control

**Feature**: 008-platform-polish-wallet-admin
**Date**: 2026-05-13
**Branch**: 007-advanced-chat-system (target: 008-platform-polish-wallet-admin)

---

## 1. Wallet Architecture

### Decision: Single `WalletBalance` field on `User` + append-only `WalletTransaction` ledger

**Rationale**: Adding `WalletBalance` (decimal) directly to the `User` model is the
simplest approach for quick reads (balance display on home/profile). The append-only
`WalletTransaction` table acts as the audit trail. Balance is the running total; it
is never calculated from transactions at query time (avoids expensive SUM on every read).

**Atomic deduction pattern**: All wallet deductions/credits MUST use a db transaction:
```csharp
await using var tx = await _db.Database.BeginTransactionAsync();
// 1. Lock user row, check balance
// 2. Deduct/credit WalletBalance
// 3. Create WalletTransaction record
// 4. Commit
```

**Alternatives considered**:
- Calculate balance from transaction SUM on every read → rejected (expensive, N+1 risk)
- Separate Wallet entity table → rejected (over-engineering for single-user wallet)

**Platform top-up limit**: 10,000 ج.م per transaction (matches spec FR-003).

---

## 2. Admin Panel Gap Analysis

### Existing coverage (AdminController.cs — 1,121 lines):
✅ Users: full CRUD + role management + toggle status  
✅ KYC: list, detail, approve (grants Executor role + notification), reject with reason  
✅ Categories: CRUD  
✅ Services: CRUD + toggle active + price/category filters  
✅ Orders: list with filters, status update, detail view with chat/escrow/payment  
✅ Tickets: list, detail, reply (SignalR), close, resolve dispute (refund/release)  
✅ Chats: list + detail view (admin monitoring)  
✅ Payments: list with filters + detail  
✅ Notifications: list, send to user or all, delete  
✅ System Settings: email settings CRUD  
✅ Dashboard: stats + recent orders + chart data endpoint  

### Gaps identified (MISSING in AdminController):
❌ **Wallet Management**: No view of user balances, no manual credit/debit, no transaction history  
❌ **AuditLog**: No admin action logging anywhere in the codebase  
❌ **WalletTransaction history**: No dedicated view  
❌ **System Settings**: Only email settings; missing `CommissionRate`, `MaxWalletTopUp`, `PlatformName`  
❌ **Admin auth guard**: `AdminController` has NO `[Authorize]` attribute — any user can hit admin endpoints!

### Security Fix Required (Critical):
`AdminController` must be protected. Pattern: check `user.IsAdmin` or add `[Authorize(Policy = "AdminOnly")]`.

---

## 3. Frontend Gap Analysis

### Home Page (`index.tsx`):
- Search bar is UI-only (no backend call on type) → needs debounced `GET /api/Services?search=`
- Notification button routes to `/Admin/Notifications` → wrong route for student users
- Wallet card: absent — needs to display `user.walletBalance`
- Banner: hardcoded promo content (acceptable for now, no API needed)
- Design: inconsistent corner radius vs profile.tsx (header uses `borderRadius: 32` vs profile `40`)

### Profile Page (`profile.tsx`):
- Wallet menu item has `value: '0 ج.م'` hardcoded → needs live balance from Redux store
- Wallet menu item has `route: ''` (empty) → needs `/student/(tabs)/wallet`

### Orders Flow:
- `createOrder` in `ordersSlice.ts` does NOT deduct from wallet → bypasses payment
- Order creation currently sets status `"Pending"` directly (bypassing escrow)
- `PaymentsController.Process` adds Payment record but doesn't check/deduct wallet

### Executor Flow:
- `executor-earnings.tsx` shows earnings from `Payments` table but doesn't reflect wallet balance
- No "Accept Order" action exists in the frontend — executor sees available orders but can't accept them via API call (missing button handler or the button calls the wrong endpoint)

### Search:
- `search.tsx` exists but needs verification it calls backend with query params

### Pages to evaluate for removal:
- `/Admin/Notifications.tsx` (in mobile app) — this is an admin page surfaced in student nav, wrong
- `onboarding.tsx` — verify if it's reachable after first-launch flow
- `categories.tsx` tab — duplicate of home page categories section; evaluate if standalone page needed

---

## 4. API Endpoints: New vs Existing

### New API endpoints needed (backend):

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/Wallet` | Get current user wallet balance + recent transactions |
| POST | `/api/Wallet/TopUp` | Add funds to wallet (body: `{ amount: decimal }`) |
| GET | `/api/Services?search=&categoryId=` | Add search/filter params to existing GET (currently no filtering) |
| POST | `/api/Orders/{id}/Accept` | Executor accepts an available order |
| POST | `/api/Orders/{id}/Complete` | Mark order as complete + trigger escrow release |

### New Admin MVC routes needed:

| Route | Purpose |
|-------|---------|
| `GET /Admin/Wallet` | List all users with balances + total |
| `GET /Admin/Wallet/{userId}` | User wallet detail + transaction history |
| `POST /Admin/Wallet/Credit` | Manually credit a user's wallet |
| `POST /Admin/Wallet/Debit` | Manually debit a user's wallet |
| `GET /Admin/AuditLog` | View all audit log entries (paged) |
| `GET /Admin/Settings` | Combined settings view (add Commission, MaxTopUp, PlatformName) |

---

## 5. Design Token Unification

### Current inconsistencies found:
| Property | Home (`index.tsx`) | Profile (`profile.tsx`) | Fix |
|----------|--------------------|------------------------|-----|
| Header border radius | 32 | 40 | → 32 (home is more accurate; profile tweaked to 32) |
| Card shadow style | `boxShadow` array | `boxShadow` array | ✅ Consistent |
| Font size heading | 26 (greeting), 22 (subtitle) | 22 (header title) | ✅ Similar |
| Section padding | `paddingHorizontal: 24` | `padding: 24` | ✅ Consistent |
| Card border radius | 20 (service cards) | 20 (stats), 24 (menu) | Minor variance, standardize to 20 |

### Design token additions needed in `Colors.ts`:
- `walletGreen`: `'#10B981'` — for positive balance indicators
- `walletRed`: `'#EF4444'` — for deductions
- `cardRadius`: `20` — single source of truth for card corner radius

---

## 6. Pages to Remove / Redirect

After analyzing navigation structure:

| Page | Status | Action |
|------|--------|--------|
| `app/Admin/Notifications.tsx` | Only admin notification page in mobile app | **Remove**: Admin pages shouldn't be in student nav. Functionality belongs in the admin web panel. |
| `app/student/(tabs)/categories.tsx` | Standalone categories tab | **Evaluate**: Keep if it provides richer experience than home's horizontal scroll; the plan will keep it but remove it from the bottom tab bar (accessible via home "الكل" button only) |
| `app/onboarding.tsx` | First-launch onboarding | **Keep**: verified as reachable from the root `_layout.tsx` check |

---

## 7. EF Core Migration Strategy

New model changes:
1. Add `WalletBalance decimal` to `User`
2. Add `WalletTransaction` entity + DbSet
3. Add `AuditLog` entity + DbSet
4. Update `SystemSetting` seed data (CommissionRate, MaxWalletTopUp, PlatformName)
5. Add search params to `ServicesController`

All changes require ONE migration: `AddWalletAndAuditLog`

---

## Resolutions Summary

All NEEDS CLARIFICATION items from spec resolved:

| Item | Resolution |
|------|-----------|
| Wallet storage | WalletBalance on User + WalletTransaction ledger |
| Admin auth | Add IsAdmin check to AdminController (existing pattern) |
| Pages to remove | Admin/Notifications.tsx from mobile app; categories tab from tab bar |
| Order acceptance | New `POST /api/Orders/{id}/Accept` endpoint |
| Top-up gateway | Simulated (direct balance credit) per spec assumption |

# Feature Specification: Platform Polish, Wallet & Full Admin Control

**Feature Branch**: `008-platform-polish-wallet-admin`
**Created**: 2026-05-13
**Status**: Draft
**Input**: User description: "improve rewrite home page in UIS to adapt with other pages + add wallet internal + make admin panel in server fully controls for every thing + connect all features in frontend with all backend and test it and fix any problem in front or backend + improve design for app to adapt with all scenarios + remove not important pages in UIS"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Redesigned Home Page with Wallet Summary Card (Priority: P1)

A student opens the app and sees a redesigned home page that visually matches the
design language of all other pages (same card styles, colors, typography, spacing,
and bottom tab layout). At the top of the home page, a wallet summary card shows
their current balance prominently. Below it, categories, a promo banner, and
popular services appear — all visually consistent with the `orders.tsx` and
`profile.tsx` design.

**Why this priority**: The home page is the first screen every user sees. Visual
inconsistency destroys trust. The wallet balance card on home is the entry point
for the internal wallet feature.

**Independent Test**: Launch app, log in as a student. Verify home page
header/card/list styling is indistinguishable in design language from the
Orders tab and Profile tab. Verify a wallet balance card appears with a real
balance fetched from the API.

**Acceptance Scenarios**:

1. **Given** a logged-in student, **When** the home page loads, **Then** the header
   gradient, card radius, font sizes, and color tokens MUST match those used in
   `orders.tsx` and `profile.tsx` exactly.
2. **Given** a logged-in student, **When** the home page loads, **Then** a wallet
   balance card is visible showing the user's current balance (e.g., "رصيدك: 150
   ج.م") fetched live from the backend.
3. **Given** a student with 0 balance, **When** the home page loads, **Then** the
   wallet card shows "0.00 ج.م" with a call-to-action to add funds.
4. **Given** the app on an RTL device, **When** the home page renders, **Then** all
   layout elements are mirrored correctly for Arabic RTL.

---

### User Story 2 — Internal Wallet: Balance, Top-Up, and History (Priority: P1)

A student can navigate to a dedicated Wallet screen (accessible from home wallet
card and profile tab). The screen shows their current balance, a list of
transaction history (top-ups, order deductions, escrow releases), and a button to
add funds. Adding funds presents a simple amount input; on confirmation, the
balance is updated and a new transaction record appears.

**Why this priority**: Wallet is the payment backbone. Without it, the escrow flow
has no funding source. This is a new, critical feature absent from the current system.

**Independent Test**: Navigate to Wallet screen. Confirm balance displays. Tap
"Add Funds", enter 100, confirm. Verify balance increases by 100 and a new
"Top-up" entry appears in the transaction list.

**Acceptance Scenarios**:

1. **Given** a student, **When** they open the Wallet screen, **Then** their current
   balance is displayed with two decimal places and the currency unit (ج.م).
2. **Given** a student, **When** they tap "Add Funds" and enter a valid amount,
   **Then** the balance increases by that exact amount and a transaction record
   is created with timestamp and type "Top-up".
3. **Given** a student, **When** they place an order, **Then** the order amount is
   deducted from the wallet balance instantly and appears as "Order Payment"
   in transaction history.
4. **Given** an executor, **When** an order is marked complete and funds released from
   escrow, **Then** the executor's wallet balance increases by the order amount
   and a "Escrow Release" transaction appears.
5. **Given** a student, **When** they attempt to top-up with 0 or a negative value,
   **Then** an Arabic validation error message is shown and no balance change occurs.
6. **Given** a student with insufficient wallet balance, **When** they attempt to
   place an order, **Then** they receive a clear error "رصيدك غير كافٍ" and are
   directed to the wallet top-up screen.

---

### User Story 3 — Full Admin Panel Control (Priority: P2)

An admin opens the web-based MVC Admin Panel and can control every aspect of the
platform from a single interface:
- **Users**: View, search, activate/deactivate, edit roles, reset passwords.
- **Wallet & Transactions**: View all user wallet balances, all transactions, and
  manually credit or debit any user's wallet.
- **Orders**: View all orders with full lifecycle status; manually change order
  status; force-complete, cancel, or dispute any order.
- **KYC**: Review, approve, and reject identity verification requests with reason.
- **Services & Categories**: Full CRUD — create, edit, toggle active, delete.
- **Tickets**: View all support tickets, assign to staff, close with resolution note.
- **Notifications**: Send a system notification to any user or all users.
- **System Settings**: Edit key platform settings (e.g., commission rate,
  upload size limit, platform name).
- **Audit Log**: View a timestamped log of all admin actions (who did what and when).

**Why this priority**: The admin panel is the operational backbone. Gaps in admin
control create operational blindspots.

**Independent Test**: Log in to the admin panel. Navigate to each section. Perform
one CRUD operation per section. Verify every action is reflected in the database
and appears in the Audit Log.

**Acceptance Scenarios**:

1. **Given** an admin, **When** they navigate to the Users section, **Then** they
   can search by name/email and see all users with their roles and wallet balance.
2. **Given** an admin, **When** they manually credit a user's wallet with 200 ج.م,
   **Then** the user's balance increases by 200 and a transaction record of type
   "Admin Credit" is created.
3. **Given** an admin, **When** they change an order status to "Completed", **Then**
   the escrow funds are automatically released to the executor's wallet.
4. **Given** an admin, **When** they approve a KYC request, **Then** the user's
   `IsExecutor` flag is set and the user receives a notification.
5. **Given** an admin, **When** they toggle a service to inactive, **Then** that
   service disappears from the student-facing service list immediately.
6. **Given** an admin, **When** they perform any action, **Then** an audit log entry
   is created with: admin's identity, action type, target entity, and timestamp.

---

### User Story 4 — Full Frontend–Backend Feature Integration & Bug Fixes (Priority: P2)

All existing frontend screens are fully wired to their backend endpoints with
no broken calls, missing error handlers, missing loading states, or disconnected
features. All identified disconnects (e.g., search not triggering API, filter not
sent to backend, profile edit not persisting) are fixed. Backend endpoints missing
for connected frontend features are implemented.

**Why this priority**: Disconnected features create a broken user experience and
cannot be demoed or shipped. Integration is necessary before design polish matters.

**Independent Test**: Walk through every app screen as student and executor:
browse → search → order → pay (wallet) → chat → track → complete.
Verify no screen shows a permanent loading spinner, unhandled error, or stale data.

**Acceptance Scenarios**:

1. **Given** a student on the search screen, **When** they type a keyword, **Then**
   the services list filters within 1 second using the backend search endpoint.
2. **Given** a student, **When** they submit a service order, **Then** the payment is
   deducted from their wallet (not a mock), an escrow entry is created, and the
   order appears in their orders list with status "AwaitingAcceptance".
3. **Given** an executor, **When** they accept an order, **Then** the order status
   changes to "InProgress" and the student receives a real-time notification.
4. **Given** any user, **When** a backend call fails, **Then** a user-friendly Arabic
   error toast/snackbar is shown (not a blank screen or unhandled crash).
5. **Given** a student, **When** they edit their profile and save, **Then** the
   updated name/bio/university is persisted and reflected on next app launch.

---

### User Story 5 — Design Consistency & Unnecessary Page Removal (Priority: P3)

The app design is elevated and unified across all screens. Screens that are
redundant, empty, or unreachable are removed. The remaining screens share:
- A consistent color palette, gradient style, and card corner radius.
- Uniform padding, font sizes, and section heading styles.
- Smooth RTL-aware animations on page transitions and list items.
- A cohesive bottom tab bar with correctly labeled Arabic icons.

Pages identified for removal (based on current structure analysis):
- `Admin/Notifications.tsx` — functionality moved to inline notification badge.
- Any duplicate or stub screens with no backend connection and no user value.

**Why this priority**: Polish comes after functionality. Once integration (P2) is
complete, unifying the visual language takes the app from functional to shippable.

**Independent Test**: Navigate every remaining screen on both LTR and RTL device.
No screen should have mismatched card styles, broken layouts, or a visual style
that differs from the design system. Removed pages should return a 404/redirect,
not crash the app.

**Acceptance Scenarios**:

1. **Given** any screen in the student flow, **When** a user views it, **Then** card
   corner radius, primary color, font weight for headings, and section padding
   MUST match the design token values established in `Colors.ts`.
2. **Given** the bottom tab bar, **When** a student views it, **Then** only relevant,
   connected tabs are shown (no placeholder or empty tabs).
3. **Given** a removed page route is accessed (deep-link), **When** the app processes
   it, **Then** the user is redirected to the home page gracefully (no crash).
4. **Given** the app on RTL layout, **When** any list or card is displayed, **Then**
   text aligns right, icons mirror correctly, and no element overflows its container.

---

### Edge Cases

- What happens when a student's wallet balance exactly equals the order price?
  → Order MUST proceed; wallet reaches 0 ج.م and shows "0.00 ج.م".
- What happens if two students attempt to accept the same available order simultaneously?
  → The first acceptance wins; the second receives a "تم قبول هذا الطلب" error.
- What happens if an admin attempts to delete a user with active escrow funds?
  → The action MUST be blocked with a warning: funds must be released or refunded first.
- What happens if the backend is unreachable when the home page loads?
  → A retry button and offline message are shown in Arabic; no crash occurs.
- What happens if a wallet top-up amount exceeds the platform limit (e.g., 10,000 ج.م)?
  → Validation error with the limit stated clearly.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a `Wallet` balance field per user, persisted in the
  database, representing their spendable internal credit in Egyptian Pounds.
- **FR-002**: The system MUST provide an API endpoint to retrieve the current user's
  wallet balance and transaction history.
- **FR-003**: The system MUST provide an API endpoint to add funds (top-up) to a user's
  wallet, validating the amount is > 0 and ≤ 10,000 ج.م per transaction.
- **FR-004**: Order payment MUST deduct from the student's wallet balance atomically;
  if balance is insufficient, the order MUST NOT be created.
- **FR-005**: Escrow release on order completion MUST atomically credit the executor's
  wallet and create a corresponding `WalletTransaction` record.
- **FR-006**: The admin panel MUST display a Wallet Management section listing all users
  with their balances and allowing manual credit/debit with reason.
- **FR-007**: The admin panel MUST display an Audit Log section listing all admin actions
  with actor, action, target, and timestamp.
- **FR-008**: The admin panel MUST support full CRUD for Services and Categories.
- **FR-009**: The admin panel MUST support viewing and manually updating Order status.
- **FR-010**: The admin panel MUST support sending notifications to individual users or
  all users.
- **FR-011**: The home page MUST display the student's wallet balance in a summary card.
- **FR-012**: The home page search MUST trigger a backend-filtered service list within
  1 second of the user stopping typing (debounced, 500ms).
- **FR-013**: All frontend API calls MUST display a loading indicator and handle error
  states with an Arabic user-facing message.
- **FR-014**: The profile edit screen MUST persist changes to the backend and reflect
  them on the next session.
- **FR-015**: Removed/deprecated app screens MUST be redirected to an existing route;
  they MUST NOT cause runtime crashes.

### Key Entities

- **WalletTransaction**: Represents a single wallet balance change event.
  Fields: `Id`, `UserId`, `Amount` (positive=credit, negative=debit), `Type`
  (TopUp, OrderPayment, EscrowRelease, AdminCredit, AdminDebit, Refund),
  `Description`, `CreatedAt`, `RelatedOrderId?`.
- **AuditLog**: Records every admin action.
  Fields: `Id`, `AdminId`, `Action` (string), `TargetEntityType`, `TargetEntityId`,
  `Details` (JSON blob), `CreatedAt`.
- **SystemSetting** *(existing)*: Extended to cover `CommissionRate`,
  `MaxWalletTopUp`, `PlatformName`.
- **User** *(extended)*: Add `WalletBalance` (decimal, default 0.00).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of app screens load without a blank/crash state on both fresh
  launch and navigation from another screen.
- **SC-002**: Wallet balance is visible on the home page within 2 seconds of login
  on a standard mobile connection (< 20ms server response assumed).
- **SC-003**: All student flows (browse → order → pay → track → complete) can be
  completed end-to-end without manual API calls or workarounds.
- **SC-004**: The admin panel covers 100% of entities in the data model with at
  least view capability, and ≥ 80% with full CRUD.
- **SC-005**: Zero screens in the final app have a design style that deviates from
  the shared color/spacing token system (audited by side-by-side comparison).
- **SC-006**: Every admin action (create, update, delete, approve, reject) produces
  a corresponding audit log entry — verified by querying the audit log after each action.
- **SC-007**: RTL layout passes visual inspection on all screens with no overflowing
  or misaligned elements.
- **SC-008**: All frontend error states show an Arabic-language message; no screen
  displays a raw English error or an empty white state.

---

## Assumptions

- The existing `Colors.ts` design token file is the single source of truth for
  all color values and MUST NOT be duplicated or overridden per-screen.
- Wallet top-up is simulated (no real payment gateway) — funds are added directly
  to the balance on confirmation; a real gateway integration is out of scope.
- The admin panel runs as an MVC web application at `/Admin` on the same server as
  the API; no separate admin frontend is needed.
- The executor's earnings flow already exists in the escrow model; this spec extends
  it by connecting it to the new `WalletBalance` field on the `User` model.
- RTL support uses React Native's built-in `I18nManager.isRTL`; no third-party
  i18n library is introduced.
- "Remove not important pages" refers to pages that are unreachable in the current
  navigation flow or have no backend backing and no user-facing value — a final
  list will be determined during implementation by auditing the router.
- Commission deduction from escrow release (platform fee) is out of scope for this
  spec; the full order amount goes to the executor's wallet.

# Quickstart: Platform Polish & Wallet

This guide outlines the major technical checkpoints for testing the `008-platform-polish-wallet-admin` feature.

## 1. Database Migrations

You MUST create and apply the new database migration before testing.
```bash
cd msa3ed/server
dotnet ef migrations add AddWalletAndAuditLog
dotnet ef database update
```

## 2. Test Accounts

The following scenarios require specific setups:
- **Admin**: Needs `IsAdmin = true`. Log into the web panel at `http://localhost:5035/Admin`.
- **Student**: Normal user without `IsExecutor`. Starts with `0.00` wallet balance.
- **Executor**: User with `IsExecutor = true` (approved KYC).

## 3. Testing the Wallet Flow

1. **Top-Up**: Log in as a Student on the mobile app. Navigate to Wallet. Add `500`. Verify the balance updates immediately.
2. **Order Creation**: Create an order for a service costing `100`. Verify wallet balance drops to `400` instantly.
3. **Admin Verification**: Open Admin Panel -> Wallet. Locate the student and verify the `400` balance and the two transaction logs.
4. **Completion**: Log in as Executor. Accept and complete the order. Verify the Executor's wallet increases by `100`.

## 4. Testing Admin Audit Logs

1. Open Admin Panel -> Users.
2. Toggle the active status of any user.
3. Open Admin Panel -> Audit Logs.
4. Verify a new record appears showing your Admin name, the `ToggleUserStatus` action, and the target user.

## 5. UI/UX Verification

- Launch the mobile app in RTL (Arabic).
- Verify the Home page header radius matches the Profile page exactly.
- Verify the Home page has a Wallet card displaying real data.
- Verify that attempting to visit `Admin/Notifications` on mobile results in a 404/redirect (page removed).

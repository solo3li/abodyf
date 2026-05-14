# Quickstart: complete-api-features

## Prerequisites
- Backend: `.NET 10.0`
- Database: `PostgreSQL`
- Existing `IAuditLogService` and `IFileService` implementation.

## Developer Setup
1. Apply migrations:
   ```bash
   dotnet ef migrations add AddMarketplaceFinalFeatures
   dotnet ef database update
   ```
2. Seed initial settings:
   ```sql
   INSERT INTO "SystemSettings" ("Key", "Value") VALUES ('MinWithdrawalAmount', '100');
   ```

## Local Verification
1. **Withdrawals**: 
   - Login as Executor. 
   - `POST /api/Wallet/Withdrawals` with a sample `.jpg`.
   - Login as Admin.
   - `POST /api/Wallet/Withdrawals/Admin/{id}/Resolve` with `Status=Approved`.
   - Verify balance deduction in `Users` table.

2. **Reviews**:
   - Login as Student.
   - Complete an order.
   - `POST /api/Reviews` with rating `5`.
   - Verify `Service.Rating` updates.

3. **Disputes**:
   - `POST /api/Orders/{id}/Dispute` as Student.
   - Verify `Order.Status` is `Disputed`.
   - Resolve as Admin via `/api/Orders/{id}/Dispute/Admin/Resolve`.

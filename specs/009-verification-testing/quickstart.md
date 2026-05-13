# Quickstart: Run & Test Guide

## Prerequisites
1. Docker running for PostgreSQL.
2. .NET 10 SDK installed.
3. Node.js 18+ and npm installed.

## 1. Start Backend
```bash
cd msa3ed/server
dotnet ef database update
dotnet run
```
*Access Swagger: `http://localhost:5000/swagger`*

## 2. Start Mobile App
```bash
cd msa3ed/UIS
npm install
npx expo start
```
*Press `w` for web version or use an emulator.*

## 3. Automated Test Suite
```bash
cd msa3ed/server
dotnet test
```

## 4. Manual Verification Checklist
- [ ] Login as **Admin** -> Navigate to `/Admin/Wallets`.
- [ ] Adjust a user balance -> Check `/Admin/AuditLogs`.
- [ ] Login as **Student** -> Search for a service -> Place Order.
- [ ] Login as **Executor** -> Accept Order -> Complete Order.
- [ ] Verify final balances in both mobile app and Admin dashboard.

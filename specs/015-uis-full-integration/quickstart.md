# Quickstart: uis-full-integration

## Prerequisites
- Backend: .NET 10 SDK, PostgreSQL
- Frontend: Node.js, Expo CLI
- Mobile: Android Emulator or iOS Simulator

## Backend Setup
1. Apply migrations:
   ```bash
   dotnet ef database update
   ```
2. Start the server:
   ```bash
   dotnet run --project msa3ed/server
   ```
3. Access Admin Panel: `http://localhost:5035/Admin` (Login with admin credentials).

## Mobile Setup
1. Install dependencies:
   ```bash
   cd msa3ed/mobile
   npm install
   ```
2. Start Expo:
   ```bash
   npx expo start
   ```
3. Open in emulator/simulator.

## Verification Steps
1. **Admin Panel**: Navigate to `/Admin/Deposits`. You should see the list of pending manual top-ups.
2. **Mobile Wallet**: Open the Wallet screen, enter an amount, and upload a screenshot. Check if it appears in the Admin Panel.
3. **Review Flow**: Complete a dummy order and verify the "Leave Review" modal appears and updates the executor's profile instantly.

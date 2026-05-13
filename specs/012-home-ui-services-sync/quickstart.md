# Quickstart: Home UI Enhancement and Data Sync

## Local Development

### 1. Backend Verification
Ensure the backend is running and has seed data for services and executors.
```bash
# Check API health
curl http://localhost:5035/api/Services
curl http://localhost:5035/api/Executors
```

### 2. Frontend Development
Start the Expo dev server.
```bash
npx expo start
```

## Manual Testing Flow
1. Log in as a Student.
2. Navigate to the Home screen.
3. Verify that the "Suggested Services" grid displays cards with real data from the database.
4. Verify that the "Featured Executors" horizontal list shows real executor profiles.
5. Click on a service to ensure it navigates to `/student/service/[id]`.

## Automated Tests
Run frontend tests:
```bash
npm test -- HomeScreen.test.tsx
```
Run backend integration tests:
```bash
dotnet test --filter Category=Integration
```

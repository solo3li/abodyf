# Quickstart: backend-full-verification

## Environment Setup
1. Ensure .NET 10.0 SDK is installed.
2. Start PostgreSQL via Docker: `docker-compose up -d`.
3. Apply migrations: `dotnet ef database update --project msa3ed/server`.

## Running the Verification Suite
1. **Automated Tests**:
   - Run unit/integration tests: `dotnet test msa3ed/Uis.Tests`.
2. **Load Testing**:
   - Install k6: `brew install k6` (or equivalent).
   - Run k6 script: `k6 run scripts/load_test.js`.
3. **Manual Verification**:
   - Start the server: `dotnet run --project msa3ed/server`.
   - Use Postman or Swagger (`/swagger`) to verify endpoints.

## Verification Checklist
- [ ] Login/Register works without OTP.
- [ ] Wallet balance updates correctly after TopUp and Payment.
- [ ] Escrow holds and releases funds on order completion.
- [ ] SignalR messages are received in real-time.
- [ ] Logs show structured JSON format with semantic properties.
- [ ] Rate limiting triggers after 100 requests within 1 minute from a single IP.

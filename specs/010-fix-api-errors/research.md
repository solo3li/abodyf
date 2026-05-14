# Research: fix-api-signalr-errors

## Phase 0: Outline & Research

### Findings

#### 1. Chat Inbox 500 Internal Server Error
- **Observation**: `GetInboxAsync` in `DomainServices.cs` uses `.OrderByDescending(c => c.Messages.Max(m => (DateTime?)m.SentAt) ?? (c.Id.ToByteArray()[0] == 0 ? ...))`
- **Decision**: Refactor the sorting logic to use standard EF Core translatable properties. Avoid `ToByteArray()` in LINQ queries.
- **Rationale**: `ToByteArray()` and complex fallback logic often fail SQL translation in Npgsql 8+, leading to runtime evaluation errors (500).
- **Alternatives considered**: Pulling all chats to memory first (`.ToList()`) then sorting, but this is inefficient for users with many conversations.

#### 2. SignalR Negotiation Failure (net::ERR_FAILED)
- **Observation**: The server maps hubs to `/hubs/chat`. The client reports `ERR_FAILED` on negotiate.
- **Decision**: Verify `AllowCredentials()` and `SetIsOriginAllowed` in `Program.cs`. Ensure the client correctly appends the base URL and doesn't double up on `/api` prefix.
- **Rationale**: SignalR negotiation requires `AllowCredentials` to be set to true and specific origins (or `AllowAnyOrigin` without credentials, which SignalR doesn't support for WebSockets). UIS `Program.cs` already has `AllowAll` policy with `AllowCredentials`, but we must ensure it's applied correctly.
- **Alternatives considered**: Switching to WebSockets-only (no negotiation), but negotiation is safer for varied network environments.

#### 3. Wallet and Order Accept 404 Errors
- **Observation**: Both controllers seem correctly annotated with `[Route("api/[controller]")]`.
- **Decision**: Verify the actual runtime routes via Swagger or diagnostic logs. Check for middleware that might be stripping or prepending paths unexpectedly (like `UsePathBase`).
- **Rationale**: 404 on seemingly valid routes usually indicates a mismatch in the base path or a missing `[ApiController]` attribute (though both have it).
- **Alternatives considered**: None; routing must be verified empirically.

### Research Tasks
- [ ] Reproduce 500 error in `ChatController.GetInbox` via integration test.
- [ ] Reproduce 404 errors for Wallet and Order Accept.
- [ ] Inspect `app.UseCors("AllowAll")` placement relative to `app.UseRouting()` and `app.UseAuthentication()`.

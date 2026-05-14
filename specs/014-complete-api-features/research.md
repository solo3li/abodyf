# Research: complete-api-features

## Unknowns & Research Tasks

### 1. Withdrawal Entity & Manual Verification Workflow
- **Question**: How to store and track manual verification of withdrawals via screenshots?
- **Decision**: Create a `WithdrawalRequest` entity with `ScreenshotUrl` (blob path) and `Status` (Pending, Approved, Rejected). Include `AdminNotes` for rejection reasons.
- **Rationale**: User clarified that withdrawals are manual via screenshots and admin approval in the panel.
- **Alternatives**: Integrated banking APIs (e.g., Stripe/Paymob). Rejected because the user specifically requested manual screenshot verification.

### 2. Review Aggregation Strategy
- **Question**: How to maintain `AverageRating` and `ReviewsCount` efficiently?
- **Decision**: Use a denormalized approach. Store `Rating` and `ReviewsCount` directly on the `Service` and `User` (Executor) entities. Update these values using a database trigger or a background service call during `ReviewService.AddReviewAsync` to avoid heavy `SUM()` queries on the storefront.
- **Rationale**: SC-002 requires real-time/near real-time updates. SC-004 requires high performance for stats.
- **Alternatives**: Dynamic calculation via SQL View. Rejected for scalability concerns with 1,000 concurrent users.

### 3. Dispute State Machine & Escrow Interaction
- **Question**: How to "freeze" Escrow during a dispute?
- **Decision**: Update the `Order` status to `Disputed`. Modify `IEscrowService.ReleaseEscrowAsync` to check if the order status is `Disputed`; if so, block the release unless called with a special `forceResolution` flag by an Admin.
- **Rationale**: SC-003 requires 100% Escrow block during disputes.
- **Alternatives**: Dedicated `IsFrozen` flag on `Escrow`. Rejected in favor of status-driven logic to minimize schema bloat.

### 4. Admin Dashboard Performance
- **Question**: How to aggregate 10,000+ orders in <500ms?
- **Decision**: Use indexed aggregate queries in PostgreSQL or a Materialized View for "Yesterday's Stats" + live delta. For the first version, optimized `COUNT/SUM` on indexed columns (`CreatedAt`, `Status`) should suffice for 10k rows.
- **Rationale**: Standard Postgres performance for indexed queries easily meets SC-004.
- **Alternatives**: Redis caching for stats. Considered if growth exceeds 1M rows.

## Best Practices
- **File Uploads**: Use `IFileService` (already implemented) for withdrawal and dispute screenshots.
- **Audit Logs**: Every status change (Withdrawal Approved, Dispute Resolved) MUST trigger `IAuditLogService.LogActionAsync` as per Principle IV.
- **RTL**: Review comments and dispute descriptions MUST be stored as NCLOB/Unicode to support Arabic, and the frontend (already verified) will handle rendering.

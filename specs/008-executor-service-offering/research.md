# Research: Executor Service Offering

## Tag Storage Strategy
- **Decision**: Use a separate `ServiceTag` entity with a Many-to-Many relationship to `ServiceOffering`.
- **Rationale**: This allows for efficient filtering by tag in the catalog and prevents data duplication. While JSON columns are easier for simple lists, a relational approach is better for the marketplace's future search performance.
- **Alternatives considered**: 
    - `Simple String`: Rejected because comma-separated strings are hard to query efficiently.
    - `JSONB Column`: Good alternative for Postgres, but relational many-to-many is more portable and idiomatic for this project's EF Core setup.

## Service Revision Logic
- **Decision**: Simple overwrite for now.
- **Rationale**: The specification doesn't explicitly require versioning or historical audit logs for service descriptions. Overwriting the current record minimizes database complexity for the initial release.
- **Alternatives considered**: 
    - `Versioned Records`: Rejected as over-engineered for the current scope.

## Admin Approval Flow
- **Decision**: Add a `Status` enum/string and a `RejectionReason` field to the `Service` entity.
- **Rationale**: Aligns with the `KycRequest` pattern already present in the codebase.
- **Alternatives considered**: 
    - `IsApproved` boolean: Rejected because it doesn't support the "Pending Approval" or "Paused" states required by FR-002.

## Image Management
- **Decision**: Reuse `IFileService` and `wwwroot/uploads`.
- **Rationale**: Maintains consistency with existing user profile and KYC image handling.

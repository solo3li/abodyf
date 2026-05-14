# Research Findings: backend-full-verification

## Decision: Rate Limiting
- **Decision**: Use `Microsoft.AspNetCore.RateLimiting` middleware introduced in .NET 7+.
- **Rationale**: Built-in, high-performance, and supports fixed window, sliding window, and token bucket algorithms.
- **Implementation**: Configure `FixedWindowRateLimiterOptions` with 100 requests per 1-minute window per remote IP address.
- **Alternatives considered**: `AspNetCoreRateLimit` (third-party). Rejected because native middleware is now mature and easier to maintain.

## Decision: Structured Logging
- **Decision**: Use `Serilog.AspNetCore` with `Serilog.Formatting.Json`.
- **Rationale**: Serilog is the industry standard for .NET structured logging. JSON formatting allows for easy ingestion by log management systems.
- **Implementation**: Configure Serilog in `Program.cs` to sink to File and Console with `JsonFormatter`.
- **Alternatives considered**: Standard `ILogger` with default console provider. Rejected because text-based logs are hard to query at scale.

## Decision: Load Testing
- **Decision**: Use `k6` (JavaScript-based load testing).
- **Rationale**: k6 is developer-friendly, allows writing tests in JS, and handles high concurrency (1,000 users) efficiently on a single machine.
- **Implementation**: Create a k6 script to hit `/api/Services`, `/api/Orders`, and `/api/Users/Me` with 1,000 virtual users.
- **Alternatives considered**: JMeter. Rejected due to heavy XML configuration and higher resource usage.

## Decision: OTP Removal Strategy
- **Decision**: Modify `IAuthService.RegisterAsync` to mark users as verified immediately and update `AuthController` to skip OTP checks.
- **Rationale**: Direct user request. Bypassing the service layer ensures consistency across all entry points.
- **Alternatives considered**: Conditional bypass in Controller. Rejected because it leaves logic fragmented.

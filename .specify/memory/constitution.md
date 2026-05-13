<!--
SYNC IMPACT REPORT
==================
Version Change:   TEMPLATE → 1.0.0 (initial ratification — MAJOR: first real constitution)
Modified Principles:
  - [PRINCIPLE_1_NAME] → I. Service-First Architecture
  - [PRINCIPLE_2_NAME] → II. Test-First Development (NON-NEGOTIABLE)
  - [PRINCIPLE_3_NAME] → III. Real-Time & Async Contract Stability
  - [PRINCIPLE_4_NAME] → IV. Security & Identity at Every Layer
  - [PRINCIPLE_5_NAME] → V. Observability & Structured Diagnostics
Added Sections:
  - Technology Stack Constraints (mandatory for all contributors)
  - Development Workflow & Quality Gates
Removed Sections:
  - None (all template sections retained and filled)
Templates Updated:
  ✅ .specify/templates/plan-template.md — Constitution Check gates verified
  ✅ .specify/templates/spec-template.md — Aligned with RBAC & real-time requirements
  ✅ .specify/templates/tasks-template.md — Task categories match new principle-driven types
Deferred TODOs:
  - None: all placeholders resolved from repo context
-->

# UIS (University Interface System) Constitution

## Core Principles

### I. Service-First Architecture

Every backend feature MUST be encapsulated in a dedicated service class with a matching
interface (e.g., `IAudioService`, `IOfferService`, `IKycService`). Controllers and Hubs
MUST NOT contain business logic — they are routing and I/O boundary layers only.
Services MUST be independently testable via constructor injection (no static coupling).
Frontend features MUST be organized as Redux slices + dedicated API hooks; UI components
MUST remain stateless and driven by props from store selectors.

**Rationale**: The platform spans Web API, MVC Admin, SignalR Hubs, and React Native. Service
encapsulation ensures each slice can be tested, replaced, or scaled without cascading changes.

### II. Test-First Development (NON-NEGOTIABLE)

All backend service logic MUST have a corresponding xUnit test written **before**
implementation begins. The Red → Green → Refactor cycle is strictly enforced.
- Contract tests for every new API endpoint or Hub method MUST exist and fail before
  the endpoint is implemented.
- Integration tests MUST cover inter-service communication: Chat ↔ SignalR Hub,
  Order ↔ Escrow, KYC ↔ Role assignment.
- Frontend: Jest tests for Redux slice reducers and critical component logic MUST
  be present before merging any P1 user story.
- No PR may be merged if tests are skipped, commented out, or left in a "TODO" state.

**Rationale**: UIS handles financial transactions (escrow), identity (KYC), and real-time
messaging. Regressions in these areas are costly and trust-eroding. Tests are the only
reliable gate.

### III. Real-Time & Async Contract Stability

All SignalR Hub methods and their client-side counterparts MUST be declared in a contract
file (e.g., `contracts/chat-hub.md`) before implementation. Hub message schemas MUST be
versioned: breaking changes to Hub method signatures REQUIRE a major version bump on the
affected Hub and MUST NOT be deployed without a coordinated frontend release.
- All async operations MUST use structured cancellation tokens.
- WebSocket reconnection logic MUST be implemented on the client with exponential
  backoff (max 30 s).
- Offline message queuing MUST ensure at-most-once delivery semantics.

**Rationale**: SignalR drives the core value proposition (instant messaging, KYC notifications,
order updates). Unstable contracts break the mobile app silently. Version discipline prevents
silent regressions across the iOS/Android/Web matrix.

### IV. Security & Identity at Every Layer

- Every API endpoint MUST declare an explicit `[Authorize]` policy; no endpoints MUST be
  anonymous unless explicitly documented as public (e.g., `GET /api/Categories`).
- RBAC claims MUST be validated at both the controller and service layer; service-layer
  checks are authoritative.
- KYC document uploads MUST never be served from a publicly guessable URL; all document
  access MUST be gated through a signed or token-protected endpoint.
- Escrow operations MUST be wrapped in database transactions; partial state is not permitted.
- JWT tokens MUST have a maximum lifetime of 24 hours; refresh tokens MUST be rotated on
  each use and stored hashed.
- All admin actions (role changes, KYC approvals, service toggles) MUST produce an audit
  log entry with actor identity and timestamp.

**Rationale**: The platform holds sensitive student data, payment funds in escrow, and
government-issued identity documents. A security failure is an existential risk.

### V. Observability & Structured Diagnostics

- All service-layer operations MUST emit structured log entries (using `ILogger<T>` with
  semantic properties, not string interpolation).
- Every external I/O boundary (database query, file upload, SignalR emit, payment call)
  MUST be wrapped in a try/catch that logs at `Error` level with context (user ID, order ID,
  operation name).
- Performance-sensitive paths (audio waveform extraction, file uploads > 5 MB) MUST record
  elapsed time via `Stopwatch` and emit a `Warning` log if they exceed defined thresholds
  (audio: 3 s, uploads: 2 s).
- The Admin Dashboard MUST surface real-time metrics: active connections, pending KYC queue
  depth, and escrow balance. These MUST be driven by live data, never cached for > 60 s.

**Rationale**: A marketplace platform with async financial workflows is impossible to debug
without instrumentation. Observability is not optional polish — it is a safety net for
production incidents.

## Technology Stack Constraints

These are non-negotiable technology choices. Deviations REQUIRE a constitution amendment.

- **Backend**: ASP.NET Core 10.0 (Web API + MVC Admin). No other server framework permitted.
- **Database**: PostgreSQL via Entity Framework Core 10. Raw SQL permitted only inside
  explicit repository methods, never in controllers or Hub code.
- **ORM Migrations**: EF Core `dotnet ef migrations add` workflow. Schema changes MUST be
  accompanied by a migration file; no manual `ALTER TABLE` in production.
- **Real-Time**: SignalR (Microsoft). No third-party WebSocket libraries.
- **Authentication**: JWT + Email OTP. No OAuth/SSO unless constitutionally amended.
- **Mobile Frontend**: Expo SDK 54 / React Native. No bare React Native workflow without
  amendment. Navigation via Expo Router (file-based). State via Redux Toolkit.
- **Styling**: Vanilla React Native `StyleSheet`. No NativeWind or StyleSheet-replacing
  libraries without amendment.
- **Media Processing**: FFMpegCore for server-side audio. No client-side waveform analysis.
- **File Storage**: Local `wwwroot/uploads` for development; path MUST be configurable via
  environment variable (`FILE_STORAGE_PATH`) for production readiness.
- **Infrastructure**: Docker Compose for PostgreSQL + pgAdmin. All developers MUST use Docker
  for the database; local PostgreSQL installs are not supported.
- **File Size Limit**: 20 MB hard cap on all uploads, enforced at both API middleware and
  client validation layers.

## Development Workflow & Quality Gates

### Branch Strategy

- `main` — production-stable, protected. Requires 1 approving review + all CI checks green.
- `[###-feature-name]` — one branch per feature spec. Naming MUST match the spec folder.
- `hamo` / personal branches — allowed for experiments; MUST NOT be merged to main directly.

### PR Quality Gates

All PRs targeting `main` or a feature branch integration MUST satisfy:
1. ✅ All existing tests pass (`dotnet test` + `npx jest`)
2. ✅ New tests written for any new service or Hub method
3. ✅ No `NEEDS CLARIFICATION` markers left in spec or plan files
4. ✅ EF Core migration applied and `dotnet ef migrations list` shows no pending migrations
5. ✅ `docker-compose up -d` succeeds from a clean state
6. ✅ Constitution Check in `plan.md` is complete (no unchecked gates)
7. ✅ RTL layout verified for any Arabic-facing UI changes (LTR test on LTR devices too)

### RTL Compliance

All React Native UI screens MUST support RTL layout for Arabic. Use
`I18nManager.isRTL`-aware flex directions. Any PR introducing new screens without RTL
validation is a blocker.

### Audit Trail

Any code touching Escrow, KYC, or RBAC MUST include a corresponding audit log call. PRs
that omit audit entries for these domains MUST NOT be merged.

## Governance

This constitution supersedes all implicit team conventions and supersedes README guidance
where they conflict. Amendments MUST follow this procedure:

1. **Propose**: Open a PR modifying this file. Include a rationale section explaining the
   necessity and any migration plan for existing code.
2. **Review**: At least one senior team member MUST review and approve. Constitutional
   amendments cannot be self-merged.
3. **Version**: Bump `CONSTITUTION_VERSION` according to semantic versioning (defined above
   in the speckit workflow — MAJOR for removals/redefinitions, MINOR for additions,
   PATCH for clarifications).
4. **Propagate**: After merge, run `@speckit-constitution` to validate template consistency.
5. **Notify**: All active feature branches MUST rebase against `main` within 3 working days
   of a constitutional amendment.

All PRs and code reviews MUST explicitly verify compliance with the five Core Principles.
Complexity violations (deviations from these principles) MUST be documented in the feature
`plan.md` Complexity Tracking table with a clear justification. Use
`.specify/memory/constitution.md` as the authoritative runtime reference during development.

**Version**: 1.0.0 | **Ratified**: 2026-05-13 | **Last Amended**: 2026-05-13

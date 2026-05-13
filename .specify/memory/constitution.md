<!--
<sync_impact_report>
{
  "version_change": "1.1.0 -> 1.2.0",
  "modified_principles": [
    {
      "old": "III. Test-First & Full-Stack Verification (NON-NEGOTIABLE)",
      "new": "III. Test-First, Full-Stack Verification & Feature Completeness (NON-NEGOTIABLE)"
    },
    {
      "old": "V. Simplicity & Reliability",
      "new": "V. Simplicity, Reliability & Complete Delivery"
    }
  ],
  "added_sections": [
    "Development Workflow > Feature Completeness & Auto-Commit"
  ],
  "removed_sections": [],
  "template_updates": [
    { "path": ".specify/templates/plan-template.md",  "status": "✅ updated – Constitution Check row III updated" },
    { "path": ".specify/templates/spec-template.md",  "status": "✅ updated – testing note updated" },
    { "path": ".specify/templates/tasks-template.md", "status": "✅ updated – completeness & commit note added" }
  ],
  "todos": []
}
</sync_impact_report>
-->

# University Interface System (UIS) Constitution

## Core Principles

### I. Library-First

Logic for features and core domains MUST be encapsulated in standalone, self-contained libraries or
services. These modules must be independently testable, well-documented, and serve a clear, focused
purpose. Avoid creating libraries solely for organizational grouping; they must represent a cohesive
unit of logic.

### II. Clean Architecture

Prioritize explicit composition, delegation, and structural integrity over complex inheritance or
hidden logic (e.g., reflection, prototype manipulation). Adhere strictly to existing workspace
conventions and idiomatic language features (e.g., type guards, explicit class instantiation).
Never use hacks to bypass the type system or suppress warnings.

### III. Test-First, Full-Stack Verification & Feature Completeness (NON-NEGOTIABLE)

TDD (Test-Driven Development) is mandatory: tests MUST be written and confirmed failing before any
implementation begins. Every new feature or fix MUST be verified with automated tests covering
**both** the frontend (React Native / Expo, using Jest) and the backend (ASP.NET Core, using xUnit)
to ensure 100% functional stability and behavioral correctness across the entire stack.

Features MUST be implemented **completely** — no stubs, no TODO placeholders left in production
paths, no half-finished flows. A feature is only done when:

1. Backend tests pass (`dotnet test`).
2. Frontend tests pass (`npx jest`).
3. The implementation is committed to version control (see Development Workflow).

Any partial implementation that lacks passing tests in either tier MUST NOT be merged.

### IV. Integration & Contract Testing

Focus integration testing on inter-service communication, shared schemas, and API contract changes.
Every external API endpoint MUST have a corresponding contract test to ensure compatibility between
services. Inter-service dependencies must be explicitly modeled and tested.

### V. Simplicity, Reliability & Complete Delivery

Prioritize simple, readable code over clever or "just-in-case" abstractions. Follow YAGNI (You
Ain't Gonna Need It) principles strictly. A task is NOT considered complete until:

- Its behavior has been empirically verified through automated tests (FE + BE).
- Its structural integrity is confirmed within the full project context.
- The resulting changes have been committed to version control.

## Additional Constraints

### Tech Stack Alignment

All development MUST align with the primary technologies: ASP.NET Core 10.0 for the backend and
Expo/React Native for the mobile frontend. Use PostgreSQL for data persistence and SignalR for
real-time features.

### Security & Integrity

Rigorously protect sensitive configuration, credentials, and system folders. Adhere to security
best practices, ensuring no secrets are exposed in logs or source control.

## Development Workflow

### Specification & Planning

Every feature MUST start with a `spec.md` defining user stories and requirements, followed by a
`plan.md` detailing the technical approach and project structure. All implementation tasks must be
derived from these documents and organized by user story.

### Validation Gates

No significant architectural changes or actions beyond the scope of a request may be taken without
explicit confirmation. Every task MUST pass through a plan-act-validate cycle, with automated tests
serving as the primary validation gate.

### Feature Completeness & Auto-Commit

Every feature implementation cycle MUST follow this sequence without exception:

1. **Write failing tests** – backend (xUnit) AND frontend (Jest) before coding.
2. **Implement** – complete the feature fully; no stubs or unfinished branches.
3. **Verify backend** – run `dotnet test`; ALL tests MUST pass.
4. **Verify frontend** – run `npx jest`; ALL tests MUST pass.
5. **Commit** – auto-commit all changes with a descriptive message once both test suites are green.

Skipping any step in this sequence is a constitution violation. The auto-commit step enforces
traceability: every merged feature has a corresponding passing-test commit in the repository.

## Governance

This Constitution is the foundational mandate for the UIS project and supersedes all general
practices or tool defaults.

### Amendments

Changes to this Constitution require a formal proposal, justification in a Sync Impact Report, and
a semantic version bump. All amendments must be documented and propagated across dependent
templates and artifacts.

### Compliance

All code reviews and pull requests MUST verify compliance with these principles. Complexity
introduced into the codebase must be explicitly justified against these standards.

**Version**: 1.2.0 | **Ratified**: 2026-05-12 | **Last Amended**: 2026-05-13

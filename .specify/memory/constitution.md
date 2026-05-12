<!--
<sync_impact_report>
{
  "version_change": "1.0.0-template -> 1.1.0",
  "modified_principles": [
    { "old": "[PRINCIPLE_1_NAME]", "new": "I. Library-First" },
    { "old": "[PRINCIPLE_2_NAME]", "new": "II. Clean Architecture" },
    { "old": "[PRINCIPLE_3_NAME]", "new": "III. Test-First & Full-Stack Verification" },
    { "old": "[PRINCIPLE_4_NAME]", "new": "IV. Integration & Contract Testing" },
    { "old": "[PRINCIPLE_5_NAME]", "new": "V. Simplicity & Reliability" }
  ],
  "added_sections": [
    "Additional Constraints",
    "Development Workflow"
  ],
  "removed_sections": [],
  "template_updates": [
    { "path": ".specify/templates/tasks-template.md", "status": "✅ updated" }
  ],
  "todos": []
}
</sync_impact_report>
-->

# University Interface System (UIS) Constitution

## Core Principles

### I. Library-First
Logic for features and core domains MUST be encapsulated in standalone, self-contained libraries or services. These modules must be independently testable, well-documented, and serve a clear, focused purpose. Avoid creating libraries solely for organizational grouping; they must represent a cohesive unit of logic.

### II. Clean Architecture
Prioritize explicit composition, delegation, and structural integrity over complex inheritance or hidden logic (e.g., reflection, prototype manipulation). Adhere strictly to existing workspace conventions and idiomatic language features (e.g., type guards, explicit class instantiation). Never use hacks to bypass the type system or suppress warnings.

### III. Test-First & Full-Stack Verification (NON-NEGOTIABLE)
TDD (Test-Driven Development) is mandatory: tests MUST be written and fail before any implementation begins. Every new feature or fix MUST be verified with automated tests in both the frontend (React Native) and backend (ASP.NET Core) to ensure 100% functional stability and behavioral correctness across the entire stack.

### IV. Integration & Contract Testing
Focus integration testing on inter-service communication, shared schemas, and API contract changes. Every external API endpoint must have a corresponding contract test to ensure compatibility between services. Inter-service dependencies must be explicitly modeled and tested.

### V. Simplicity & Reliability
Prioritize simple, readable code over clever or "just-in-case" abstractions. Follow YAGNI (You Ain't Gonna Need It) principles strictly. Validation is the only path to finality; a task is not considered complete until its behavior has been empirically verified and its structural integrity confirmed within the full project context.

## Additional Constraints

### Tech Stack Alignment
All development must align with the primary technologies: ASP.NET Core 10.0 for the backend and Expo/React Native for the mobile frontend. Use PostgreSQL for data persistence and SignalR for real-time features.

### Security & Integrity
Rigorously protect sensitive configuration, credentials, and system folders. Adhere to security best practices, ensuring no secrets are exposed in logs or source control.

## Development Workflow

### Specification & Planning
Every feature must start with a `spec.md` defining user stories and requirements, followed by a `plan.md` detailing the technical approach and project structure. All implementation tasks must be derived from these documents and organized by user story.

### Validation Gates
No significant architectural changes or actions beyond the scope of a request may be taken without explicit confirmation. Every task must pass through a plan-act-validate cycle, with automated tests serving as the primary validation gate.

## Governance
This Constitution is the foundational mandate for the UIS project and supersedes all general practices or tool defaults.

### Amendments
Changes to this Constitution require a formal proposal, justification in a Sync Impact Report, and a semantic version bump. All amendments must be documented and propagated across dependent templates and artifacts.

### Compliance
All code reviews and pull requests must verify compliance with these principles. Complexity introduced into the codebase must be explicitly justified against these standards.

**Version**: 1.1.0 | **Ratified**: 2026-05-12 | **Last Amended**: 2026-05-12

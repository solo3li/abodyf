# Implementation Plan: Executor Service Offering

**Branch**: `008-executor-service-offering` | **Date**: 2026-05-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-executor-service-offering/spec.md`

## Summary

Implement a comprehensive service offering system that allows Executors to create, publish, and manage their skills. The system will support rich metadata (estimated delivery, included revisions, and tags), a multi-stage publishing workflow (Draft -> Pending Approval -> Active), and image management. Admins will gain a dashboard to review and approve new service offerings.

## Technical Context

**Language/Version**: C# 10.0 (ASP.NET Core), TypeScript (React Native/Expo)  
**Primary Dependencies**: EF Core 10, SignalR, FFMpegCore (for potential video previews later), expo-image-picker  
**Storage**: PostgreSQL, Local File Storage (`wwwroot/uploads`)  
**Testing**: xUnit (Backend), Jest (Frontend)  
**Target Platform**: iOS, Android, Web (Admin)
**Project Type**: Web API + Mobile App + MVC Admin  
**Performance Goals**: <5s activation visibility, <1s detail page load  
**Constraints**: Positive numeric validation for price/delivery, 100-char title limit  
**Scale/Scope**: Unified service management for all Executor types.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I: Library-First** - Logic for service validation and state transitions will be encapsulated in `IServiceService`.
- [x] **Principle II: CLI Interface** - N/A for this web-based feature.
- [x] **Principle III: Test-First** - Implementation will start with contract tests for the new `ServiceDto` and API endpoints.
- [x] **Principle IV: Integration Testing** - Admin approval workflow and catalog visibility will be validated with integration tests.

## Project Structure

### Documentation (this feature)

```text
specs/008-executor-service-offering/
├── plan.md              # This file
├── research.md          # Research findings
├── data-model.md        # Entity definitions
├── quickstart.md        # Setup guide
├── contracts/           # API contracts
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
msa3ed/server/
├── Controllers/Api/
│   └── ServicesController.cs    # Executor-facing API
├── Controllers/AdminController.cs# Admin approval logic
├── Services/
│   └── IServiceService.cs       # Business logic for services
└── Models/AppModels.cs          # Entity updates

msa3ed/UIS/
├── app/
│   ├── executor/services/       # Service management screens
│   └── shared/service/          # Service detail components
├── components/
│   └── ServiceForm.tsx          # Reusable creation form
└── store/slices/
    └── servicesSlice.ts         # Redux state
```

**Structure Decision**: Hybrid Monolith. Backend logic resides in `msa3ed/server`, and Frontend logic in `msa3ed/UIS`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |

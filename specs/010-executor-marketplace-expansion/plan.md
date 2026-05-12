# Implementation Plan: Executor Marketplace Expansion

**Branch**: `010-executor-marketplace-expansion` | **Date**: 2026-05-12 | **Spec**: [specs/010-executor-marketplace-expansion/spec.md](spec.md)
**Input**: Feature specification from `/specs/010-executor-marketplace-expansion/spec.md`

## Summary
The goal is to transform the platform into a professional marketplace by introducing role-based sidebar management for executors, a modern glassmorphism UI, a mandatory Admin approval workflow for services, advanced tabbed search for both services and pros, and high-impact work galleries on executor profiles.

## Technical Context

**Language/Version**: C# 10.0 (Backend), TypeScript (Frontend: React Native 0.81, Expo 54)  
**Primary Dependencies**: EF Core 10, SignalR, Expo Router 6.0, Redux Toolkit, expo-blur  
**Storage**: PostgreSQL (New GalleryItem and ServiceApprovalLog tables)  
**Testing**: xUnit (Backend), Jest + React Testing Library (Frontend)  
**Target Platform**: Mobile (Android/iOS), Web (Admin Panel)  
**Project Type**: Mobile App + Web API + Admin Dashboard  
**Performance Goals**: <300ms search/filter latency, instant UI role-switching  
**Constraints**: Zero exposure of executor tools to student roles; max 10 gallery items.  
**Scale/Scope**: Major expansion of the Executor and Admin domains.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I: Library-First** - Domain logic for Gallery and Approvals encapsulated in `GalleryService` and `ApprovalService`.
- [x] **Principle II: Clean Architecture** - Explicit role-based rendering in UI; no "hacks" for permission bypass.
- [x] **Principle III: Test-First & Full-Stack Verification** - Mandatory tests for role-based sidebar and admin approval logic.
- [x] **Principle IV: Integration Testing** - Contract tests for new `Executors` and `Gallery` endpoints.

## Project Structure

### Documentation (this feature)

```text
specs/010-executor-marketplace-expansion/
├── plan.md              # This file
├── research.md          # UI/UX and API search strategy
├── data-model.md        # New portfolio and logging entities
├── quickstart.md        # Role-based and workflow test scenarios
├── contracts/           # Marketplace and Admin API updates
└── tasks.md             # Implementation tasks (Phase 2)
```

### Source Code (repository root)

```text
msa3ed/
├── server/              # Backend
│   ├── Data/            # New migrations for GalleryItems
│   ├── Services/        # Approval and Portfolio services
│   └── Controllers/     # Admin and Executor API updates
└── UIS/                 # Frontend
    ├── app/             # New Search and Portfolio screens
    ├── components/      # Modern Sidebar and WorkGallery components
    └── store/           # Redux slices for marketplace data
```

**Structure Decision**: Integrated Mobile + API structure within the `msa3ed` directory.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |

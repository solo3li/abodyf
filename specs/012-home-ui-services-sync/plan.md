# Implementation Plan: Home UI Enhancement and Data Sync

**Branch**: `012-home-ui-services-sync` | **Date**: Tuesday, May 12, 2026 | **Spec**: [specs/012-home-ui-services-sync/spec.md](spec.md)
**Input**: Feature specification from `/specs/012-home-ui-services-sync/spec.md`

## Summary
The goal is to fix the data fetching issues on the Home screen and elevate its UI to a professional standard. This involves updating the Redux `catalogSlice` to fetch executors, ensuring the backend correctly returns active services, and applying modern UI patterns like consistent spacing and `boxShadow`.

## Technical Context

**Language/Version**: C# 10.0 (.NET 10), TypeScript (React Native/Expo)
**Primary Dependencies**: EF Core, Redux Toolkit, React Native Reanimated, Expo Linear Gradient
**Storage**: PostgreSQL
**Testing**: Jest (FE), xUnit (BE)
**Target Platform**: iOS, Android, Web
**Project Type**: Mobile App + Web API
**Performance Goals**: Home screen data loaded in < 2 seconds
**Constraints**: Must use existing `Colors.ts` palette and Arabic typography
**Scale/Scope**: ~10 services and ~5 executors displayed on Home

## Constitution Check

- [x] **Principle I: Library-First** - Logic encapsulated in `catalogSlice` and backend services.
- [x] **Principle II: Clean Architecture** - Explicit composition in UI components.
- [x] **Principle III: Test-First & Full-Stack Verification** - TDD approach for new slice actions and controller logic.
- [x] **Principle IV: Integration Testing** - Contract tests for `GET /api/Executors`.

## Project Structure

### Documentation (this feature)

```text
specs/012-home-ui-services-sync/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (Pending)
```

### Source Code

```text
msa3ed/
├── server/              # Backend (ASP.NET Core)
│   ├── Controllers/Api/ # API Endpoints
│   ├── Services/        # Business Logic
│   └── Data/            # DB Context & Seeding
└── UIS/                 # Frontend (React Native/Expo)
    ├── app/student/     # Home Screen
    ├── store/slices/    # Redux State
    ├── components/      # Shared UI Elements
    └── services/        # API Client
```

**Structure Decision**: Mobile + API (Standard for this project).

# Implementation Plan: Mobile UI & Navigation Refresh

**Branch**: `009-mobile-ui-navigation-refresh` | **Date**: 2026-05-12 | **Spec**: [specs/009-mobile-ui-navigation-refresh/spec.md](spec.md)
**Input**: Feature specification from `/specs/009-mobile-ui-navigation-refresh/spec.md`

## Summary
The goal is to streamline the mobile application navigation by introducing a Sidebar for secondary items, limiting the Bottom Tab Bar to 4 core features, refreshing the Home UI with a search bar and vertical categories, and populating the system with realistic sample data for testing and demonstration.

## Technical Context

**Language/Version**: C# 10.0, TypeScript (React Native 0.81, Expo 54)  
**Primary Dependencies**: EF Core 10, Expo Router 6.0, @react-navigation/drawer  
**Storage**: PostgreSQL  
**Testing**: xUnit, Jest  
**Target Platform**: Android, iOS, Web  
**Project Type**: Mobile App + Web API  
**Performance Goals**: <10s Database Seeding, Instant navigation transitions  
**Constraints**: Drawer must be the top-level navigator; exactly 4 bottom tabs.  
**Scale/Scope**: System-wide navigation and seeding update.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I: Library-First** - Logic for seeding is encapsulated in `DbSeeder`.
- [x] **Principle II: Clean Architecture** - Navigation follows Expo Router's file-based and nested navigator patterns.
- [x] **Principle III: Test-First & Full-Stack Verification** - Test tasks included for navigation transitions and seeder logic.
- [x] **Principle IV: Integration Testing** - Contract tests for the modified `/api/Services` endpoint.

## Project Structure

### Documentation (this feature)

```text
specs/009-mobile-ui-navigation-refresh/
├── plan.md              # This file
├── research.md          # Navigation and Seeding research
├── data-model.md        # UI and Seeding models
├── quickstart.md        # Validation checklist
├── contracts/           # Catalog API updates
└── tasks.md             # Implementation tasks (Phase 2)
```

### Source Code (repository root)

```text
msa3ed/
├── server/              # Backend
│   ├── Data/            # DbSeeder updates
│   ├── Services/        # CatalogService search logic
│   └── Controllers/     # API endpoint updates
└── UIS/                 # Frontend
    ├── app/             # Drawer and Tab layout refactoring
    ├── components/      # New Sidebar and SearchBar components
    └── store/           # Navigation state management (if needed)
```

**Structure Decision**: Web application (Backend + Frontend) within the `msa3ed` directory.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |

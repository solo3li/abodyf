# Implementation Plan: Custom Projects & Advanced Search

**Branch**: `011-custom-projects-bidding` | **Date**: 2026-05-12 | **Spec**: [specs/011-custom-projects-bidding/spec.md](spec.md)
**Input**: Feature specification from `/specs/011-custom-projects-bidding/spec.md`

## Summary
This feature introduces a reverse-marketplace model where students can post custom projects, and executors can bid on them. It includes public job boards, private invitations, pre-acceptance chat negotiation, and an automated conversion from an accepted offer to an official order. Additionally, advanced filtering (price, rating, delivery time) will be added to the search experience.

## Technical Context

**Language/Version**: C# 10.0 (Backend), TypeScript (Frontend: React Native 0.81, Expo 54)  
**Primary Dependencies**: EF Core 10, SignalR, Expo Router 6.0, Redux Toolkit  
**Storage**: PostgreSQL (New ProjectRequest, ProjectOffer, ProjectInvitation tables)  
**Testing**: xUnit (Backend), Jest + React Testing Library (Frontend)  
**Target Platform**: Mobile (Android/iOS)  
**Project Type**: Mobile App + Web API  
**Performance Goals**: <300ms search filtering  
**Scale/Scope**: Creation of a new "Bidding" domain and expansion of the "Search" domain.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I: Library-First** - Logic for custom projects and bidding will be encapsulated in a new `IProjectService`.
- [x] **Principle II: Clean Architecture** - DTOs will be strictly separated from data models.
- [x] **Principle III: Test-First & Full-Stack Verification** - TDD approach required for the bidding arbitration logic.
- [x] **Principle IV: Integration Testing** - Contract tests required for `ProjectsController` endpoints.

## Project Structure

### Documentation (this feature)

```text
specs/011-custom-projects-bidding/
├── plan.md              # This file
├── research.md          # State transition mapping and chat integration
├── data-model.md        # Bidding and Invitation entities
├── quickstart.md        # Test scenarios for the bidding flow
├── contracts/           # New API contracts for projects
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
msa3ed/
├── server/              # Backend
│   ├── Data/            # EF Core migrations
│   ├── Services/        # IProjectService implementation
│   └── Controllers/     # ProjectsController
└── UIS/                 # Frontend
    ├── app/             # Project posting and bidding screens
    ├── components/      # AdvancedFilterSheet component
    └── store/           # Redux slices for projects
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |

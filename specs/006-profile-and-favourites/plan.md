# Implementation Plan: User Profile & Favourites

**Branch**: `006-profile-and-favourites` | **Date**: 2026-05-11 | **Spec**: [specs/006-profile-and-favourites/spec.md](spec.md)
**Input**: Feature specification from `/specs/006-profile-and-favourites/spec.md`

## Summary
Add a Favourites management system and comprehensive user profile editing capabilities, including client-side image processing for profile pictures. This involves creating a new `Favorite` entity, updating the `User` entity, and implementing a dedicated "Favourites" view in the Expo app.

## Technical Context

**Language/Version**: ASP.NET Core 10.0, TypeScript/Expo SDK 54
**Primary Dependencies**: Entity Framework Core, Redux Toolkit, expo-image-picker, expo-image-manipulator
**Storage**: PostgreSQL (Favorites, User fields), Local File Storage (Images)
**Testing**: xUnit (Backend), Jest (Frontend)
**Target Platform**: Linux (Server), Android/iOS (Mobile)
**Project Type**: Web API + Mobile App
**Performance Goals**: Favourites list load < 500ms, Text updates < 1s
**Constraints**: Client-side cropping (square), JPEG compression (0.8), character limits on text fields.

## Constitution Check

- **Monolith First**: PASS (Single backend project)
- **Single Role-Based App**: PASS (Unified Expo app)
- **Clean Models**: PASS (Using join entity for many-to-many)

## Project Structure

### Documentation (this feature)

```text
specs/006-profile-and-favourites/
├── plan.md              # This file
├── research.md          # Decisions on modeling and image processing
├── data-model.md        # Favorite entity and User updates
├── quickstart.md        # Verification flows
├── contracts/           # API endpoints (api.md)
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
msa3ed/
├── server/
│   ├── Controllers/Api/UsersController.cs
│   ├── Controllers/Api/FavoritesController.cs (New)
│   ├── Data/ApplicationDbContext.cs
│   ├── Models/AppModels.cs
│   └── Services/DomainServices.cs (Profile & Favorite logic)
└── UIS/
    ├── app/student/(tabs)/
    │   └── favourites.tsx (New)
    ├── app/student/profile/
    │   └── edit-profile.tsx (New)
    └── store/slices/
        ├── favoritesSlice.ts (New)
        └── userSlice.ts (New/Updated)
```

**Structure Decision**: Standard feature-based addition within the `msa3ed` directory.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |

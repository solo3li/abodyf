# Research: Mobile UI & Navigation Refresh

**Date**: 2026-05-12

## UI Navigation (Sidebar + Bottom Bar)

### Current State
The application uses `expo-router` with a `Tabs` layout in `msa3ed/UIS/app/student/(tabs)/_layout.tsx`. The bottom bar contains multiple items, some of which should be moved to a sidebar.

### Decision
1.  **Sidebar Integration**: Wrap the existing `Tabs` component with a `Drawer` component from `expo-router/drawer`.
2.  **Bottom Bar Refactoring**: Limit `(tabs)/_layout.tsx` to exactly 4 items: **Home, Orders, Chat, and Profile**.
3.  **Sidebar Content**: Move "Categories", "Favourites", "Earnings", and "Support" to the Sidebar.

### Rationale
Expo Router supports nested navigators. Using a Drawer as the parent of the Tabs navigator is the standard approach for this architecture.

## Home UI Refresh

### Current State
The Home screen (`msa3ed/UIS/app/student/(tabs)/index.tsx`) displays categories and services in a mixed layout.

### Decision
1.  **Search Bar**: Implement a persistent, styled search bar at the top of the Home screen.
2.  **Vertical Category List**: Replace the current category horizontal scroll/grid with a vertical list (or a more prominent vertical section) to improve hierarchy.

### Rationale
Vertical categorization allows for more descriptive labels and sub-categories, improving discovery.

## Sample Data Seeding

### Current State
`DbSeeder.cs` handles initial setup but lacks deep "playbook" data.

### Decision
1.  **Extended Seeder**: Implement `SeedSampleDataAsync` in `DbSeeder.cs` to add:
    *   5+ diverse Users (Students and Executors).
    *   10+ Services with realistic descriptions and Unsplash image URLs.
    *   Sample Orders in various states (Pending, InProgress, Completed).
    *   Sample Reviews for services.
2.  **Environment Policy**: The seeder will run in all environments on startup if the database is empty or a "force" flag is detected, ensuring placeholders are always available.

### Rationale
Comprehensive data is critical for validating the "Vertical Category List" and "Search Bar" functionality.

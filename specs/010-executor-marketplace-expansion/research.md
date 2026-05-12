# Research: Executor Marketplace Expansion

**Date**: 2026-05-12

## UI: Role-Based Sidebar & Modern Styling

### Current State
The application uses `expo-router` with a `Drawer` parent navigator. The `SidebarContent.tsx` component handles the profile display and logout.

### Decision
1.  **Role Filtering**: Modify `SidebarContent.tsx` to conditionally render "Executor Console" items (Orders, Earnings, Services) based on the `user.isExecutor` flag from the Auth context.
2.  **Modern Styling**: Implement a "Glassmorphism" effect for the sidebar using `expo-blur` and a custom background gradient. Add a "Professional Badge" section for executors showing their current rating and completed orders at the top of the drawer.

### Rationale
Leveraging the existing `AuthContext` ensures consistent role enforcement. Nested navigators in Expo Router are best managed at the top-level `_layout.tsx`.

## Search: Unified vs. Tabbed

### Current State
Search is currently a simple text filter on the Home screen.

### Decision
1.  **Tabbed Search Experience**: Create a new `/search` screen with a `MaterialTopTab` navigator (or custom segment control) to toggle between "Services" and "Professionals".
2.  **Recency-Driven Sorting**: Implement a `SortBy` parameter in the API default to `CreatedAt DESC` for both entities to satisfy the "recency-driven" requirement.

### Rationale
A tabbed interface provides a cleaner UX for multi-entity search compared to a mixed feed, reducing cognitive load for students.

## Work Gallery & Portfolio

### Current State
Executors can only upload a primary service image.

### Decision
1.  **Gallery Entity**: Introduce a `GalleryItem` table in the database linked to `User` (Executor).
2.  **Media Upload**: Reuse the `IFileService` to support multiple uploads. Implement a horizontal scrollable "Work Gallery" component on the executor's profile.

### Rationale
Decoupling the portfolio from specific services allows executors to showcase general expertise and past projects that might not be directly for sale.

## Multi-Agent Orchestration

### Decision
Use the project's internal `parallel-agent-orchestration` skill to handle concurrent updates to the backend (Services/Controllers) and frontend (App/Components) during implementation.

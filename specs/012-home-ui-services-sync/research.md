# Research: Home UI Enhancement and Data Sync

## Technical Context Research

### Summary
The goal is to fix the data fetching issues on the Home screen (where services and executors are not showing up despite existing in the database) and to improve the UI to a professional standard.

### Findings

#### 1. Frontend Data Fetching (Redux)
- **Current State**: The `HomeScreen` uses `catalogSlice` to fetch services via `fetchServices()`. It calls `/api/Services`.
- **Issue**: Executors are not being fetched. The `HomeScreen` has a section for "Featured Executors" but it uses mocked/placeholder logic (`[1, 2].map(...)`).
- **Resolution**: Need to add `fetchExecutors` to `catalogSlice` (or a new `executorsSlice`) and call it in `HomeScreen`.

#### 2. Backend API
- **Current State**: `ServicesController` exists with a `GET /api/Services` endpoint. `ExecutorsController` exists with a `GET /api/Executors`.
- **Potential Issue**: If `GET /api/Services` returns an empty list despite database content, it might be due to `Status` filtering (only 'Active' services are shown) or missing includes.
- **Resolution**: Ensure services have `Status = "Active"` in the database and verify the controller query.

#### 3. Professional UI Standards
- **Current State**: Home screen uses `LinearGradient` and basic `Pressable` cards.
- **Improvements**:
    - Add `boxShadow` to cards (already updated some components but Home needs it).
    - Use better spacing (consistent with 16px/24px grid).
    - Add loading skeletons instead of just `ActivityIndicator`.
    - Improve Arabic typography (ensure fonts are loaded and applied).

### Decisions

- **Decision**: Add `fetchExecutors` to `catalogSlice.ts`.
- **Rationale**: Keeps catalog-related discovery data in one slice.
- **Decision**: Implement a `FeaturedExecutors` component.
- **Rationale**: Cleaner code separation for the Home screen.
- **Decision**: Use `boxShadow` for all cards on Home.
- **Rationale**: Modern design standard (professional feel).

### Alternatives Considered
- **Alternative**: Create a separate `executorsSlice`.
- **Rejected**: Too much overhead for just two endpoints; `catalogSlice` is appropriate for "discovery" data.

### Best Practices for React Native UI
- Use `FlatList` for large grids (though Home has sections, so `ScrollView` + `View` is fine if items are few).
- Prefer `reanimated` for smooth transitions.
- Use `Colors.ts` for all styling to maintain theme consistency.

# Research: User Profile & Favourites

## Decision: 1. Favourites Data Modeling
- **Chosen**: Create a `Favorite` join entity (many-to-many) between `User` and `Service`.
- **Rationale**: This is the standard relational approach for bookmarking. It allows for efficient querying of a user's favourites and tracking when a service was bookmarked.
- **Alternatives Considered**: 
    - Store a list of Service IDs in a JSON field on the User table. (Rejected: harder to query for "most favourited services" or maintain referential integrity).

## Decision: 2. Profile Picture Processing (Expo)
- **Chosen**: Use `expo-image-picker` for selection and `expo-image-manipulator` for client-side cropping (square) and compression (JPEG, quality 0.8).
- **Rationale**: Reduces server-side load and bandwidth usage. Ensures consistent aspect ratio for the UI without complex CSS/styling workarounds.
- **Alternatives Considered**: 
    - Server-side processing. (Rejected: adds complexity to backend and increases upload time for the user).

## Decision: 3. Search Implementation for Favourites
- **Chosen**: Client-side filtering in Redux for the MVP, with server-side search as a fallback if the list exceeds 50 items.
- **Rationale**: Provides instantaneous feedback to the user. Given the P95 user has < 20 favourites, client-side filtering is extremely efficient.
- **Alternatives Considered**: 
    - Always server-side search. (Rejected: higher latency for small lists).

## Decision: 4. Image Storage Path
- **Chosen**: Store images in `wwwroot/uploads/profiles/` and save the relative URL in the `User` table.
- **Rationale**: Simple and works well for the current monolith deployment.
- **Alternatives Considered**: 
    - S3/Cloud Storage. (Rejected: out of scope for current local deployment constraints).

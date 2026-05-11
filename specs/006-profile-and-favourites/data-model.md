# Data Model: User Profile & Favourites

## Entities

### Favorite (New)
- **Fields**:
    - `Id`: Guid (PK)
    - `UserId`: Guid (FK to Users)
    - `ServiceId`: Guid (FK to Services)
    - `CreatedAt`: DateTime (defaults to UtcNow)
- **Relationships**:
    - Many-to-One with `User`
    - Many-to-One with `Service`
- **Validation**:
    - Unique constraint on (`UserId`, `ServiceId`) to prevent duplicate bookmarks.

### User (Updated)
- **Fields**:
    - `FullName`: String (Length: 100, Required)
    - `University`: String (Required)
    - `Major`: String (Optional)
    - `Bio`: String (Length: 500, Optional)
    - `ProfilePicture`: String (URL, Optional)
- **Relationships**:
    - One-to-Many with `Favorite`

## State Transitions

### Toggling Favourites
- `Click Heart` -> If exists: `Delete Favorite` -> UI: `Unfilled Heart`
- `Click Heart` -> If not exists: `Create Favorite` -> UI: `Filled Heart`

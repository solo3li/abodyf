# Quickstart: Mobile UI & Navigation Refresh

## Backend: Seeding Sample Data

To populate the database with the new sample data:

1.  **Automatic**: Sample data is seeded automatically on application startup if no users (other than the default admin) are found.
2.  **Manual**:
    - Navigate to the `msa3ed/server` directory.
    - Run the seeder manually via `dotnet run --seed-sample-data`.

## Frontend: Navigation & UI

### Navigation Structure
- **Sidebar**: Swipe from the right or tap the "Hamburger" icon in the header.
- **Bottom Bar**: Access the 4 core tabs (Home, Orders, Chat, Profile).

### Home Screen
- **Search**: Use the top search bar to filter services by title or category.
- **Categories**: Browse the vertical category list to narrow down your search.

## Validation Checklist

1. [ ] **Navigation**: Bottom bar has exactly 4 items.
2. [ ] **Sidebar**: Drawer menu contains "Categories", "Favourites", "Earnings", and "Support".
3. [ ] **Home UI**: Search bar is functional and styled.
4. [ ] **Home UI**: Categories are displayed in a vertical layout.
5. [ ] **Data**: Services and Users from the seeder are visible in the app.

# Data Model: Mobile UI & Navigation Refresh

## UI Models (Frontend)

### NavigationState
- **SidebarItems**: List of secondary routes (Settings, Support, Categories).
- **TabItems**: Fixed list of 4 primary routes (Home, Orders, Chat, Profile).

## Seeding Logic (Backend)

### SampleDataSeeder (Service)
Responsible for generating:
- **Users**: 
    - 3 Students (pre-verified).
    - 2 Executors (KYC approved).
- **Services**: 
    - Distributed across categories.
    - Status: "Active".
- **Orders**: 
    - Linked between sample users and services.
    - Transitions: "Pending" -> "Accepted" -> "Completed".
- **Reviews**: 
    - Text reviews with 1-5 star ratings.

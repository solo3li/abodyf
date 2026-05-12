# Quickstart: Custom Projects & Advanced Search

## Testing Scenarios

### 1. Advanced Search Filters
- **Navigate**: Go to Search screen.
- **Action**: Open Filter sheet. Set Max Price to 200 and Min Rating to 4.5.
- **Verify**: Only services/executors matching these exact criteria are displayed. The UI updates instantly.

### 2. Post a Custom Project
- **Login as Student**.
- **Navigate**: Go to "My Projects" (new tab or profile section).
- **Action**: Post a new request for "Mobile App Bug Fix" with a 500 EGP budget.
- **Verify**: The project appears in the student's list as "Open".

### 3. Bidding Flow
- **Login as Executor**.
- **Navigate**: Go to "Available Projects" (Executor Console).
- **Action**: Find the "Mobile App Bug Fix" project and submit an offer for 450 EGP and 2 days.
- **Verify**: The offer shows as "Pending" in the executor's dashboard.

### 4. Arbitration & Order Creation
- **Login as Student**.
- **Navigate**: Go to the project details.
- **Action**: View the executor's offer and click "Accept".
- **Verify**: The project status changes to "Closed". Navigate to "My Orders" and verify a new order exists for 450 EGP linked to the executor.

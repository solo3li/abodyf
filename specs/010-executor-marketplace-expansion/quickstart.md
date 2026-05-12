# Quickstart: Executor Marketplace Expansion

## Testing Scenarios

### 1. Role-Based Sidebar (Frontend)
- **Login as Student**: Open sidebar -> Verify NO "My Earnings" or "My Services" items appear.
- **Login as Executor**: Open sidebar -> Verify "Executor Console" section is visible with Orders, Earnings, and Services.

### 2. Admin Service Approval (Full-Stack)
- **Executor Flow**: Create a new service -> Status remains `Draft`. Click "Submit for Review" -> Status becomes `PendingApproval`.
- **Admin Flow**: Open Admin Dashboard -> Navigate to "Service Approvals" -> Click "Approve" on the new service.
- **Verification**: Check public Home page -> Verify the service is now visible in "Newest Services".

### 3. Search & Discovery (Frontend/API)
- Navigate to the Search screen.
- Toggle to "Executors".
- Type a keyword (e.g., "React").
- Verify that a list of matching professionals appears with their ratings and portfolio badges.

### 4. Work Gallery (Executor Profile)
- Login as Executor.
- Navigate to "My Profile" -> "Edit Gallery".
- Upload a project screenshot.
- Log out and login as Student.
- Search for the executor and view their profile.
- Verify the screenshot is visible in the "Work Gallery" grid.

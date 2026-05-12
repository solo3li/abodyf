# Quickstart: Executor Service Offering

## Local Setup

### Backend (ASP.NET Core)
1. Ensure the `wwwroot/uploads` directory exists.
2. Apply database migrations:
   ```bash
   cd msa3ed/server
   dotnet ef migrations add AddServiceOfferingFeatures
   dotnet ef database update
   ```
3. Run the project:
   ```bash
   dotnet run
   ```

### Frontend (React Native/Expo)
1. Install new dependencies (if any):
   ```bash
   cd msa3ed/UIS
   npm install
   ```
2. Start the development server:
   ```bash
   npx expo start
   ```

## Development Workflow

1. **Database**: Updates to `AppModels.cs` require a migration.
2. **Business Logic**: Implement state transitions and validation in `ServiceService.cs`.
3. **UI**:
   - Create `executor/services/` screens using the existing `ChatCard` or `ServiceCard` style components.
   - Use `expo-image-picker` for cover image selection.
   - Implement the `ServiceForm` component with validation for required fields.

## Verification Steps

1. **Creation**: Log in as an Executor, create a draft service, and verify it appears in "My Services".
2. **Submission**: Click "Submit for Review" and verify the status changes to `PendingApproval`.
3. **Admin**: Log in as Admin, navigate to the Admin Dashboard, approve the service.
4. **Visibility**: Verify the service now appears in the main Student catalog.

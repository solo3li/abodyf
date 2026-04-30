# Frontend Business Logic Documentation: UIS (Expo Mobile App)

This document details the client-side business rules, state management, and interaction flows within the UIS mobile application.

## 1. Core State & Authentication Logic

### 1.1 Redux Store Architecture
The application uses **Redux Toolkit** for centralized state management, split into functional slices:
-   **authSlice:** Manages JWT tokens, user profiles, and session lifecycle.
-   **catalogSlice:** Handles service categories and marketplace listings.
-   **ordersSlice:** Tracks student and executor order history and available tasks.
-   **chatSlice:** Manages real-time message history and local updates.
-   **kycSlice:** Tracks the status of identity verification submissions.
-   **ticketsSlice:** Manages technical support and dispute interactions.

### 1.2 The Authentication Workflow
-   **Login Initiation:** User provides email/password. The `auth/login` thunk calls the backend and stores a temporary token.
-   **OTP Challenge:** Upon login, the app redirects to `(auth)/otp-verify`.
-   **Session Persistence:** After OTP verification, the full user object is stored. The `setAuthToken` helper ensures every subsequent `apiFetch` includes the `Authorization: Bearer <token>` header.
-   **Auto-Login:** The `AuthContext` triggers `fetchMe` on app launch if a token exists, refreshing the user's role and profile.

## 2. Navigation & Routing Logic

### 2.1 The "Gatekeeper" Logic (`app/index.tsx`)
On startup, the app checks the user state:
-   If **No User:** Redirect to `onboarding` or `login`.
-   If **Authenticated:** Redirect directly to `/student`.

### 2.2 Role-Based Tabs (`app/student/(tabs)/_layout.tsx`)
The tab bar dynamically adapts based on the `user.isExecutor` boolean:
-   **Student Only:** Sees "Categories" but hides "Available Orders" and "Earnings".
-   **Executor:** Hides "Categories" (to save space) but gains "Available Orders" and "Earnings".
-   **Shared:** "My Orders", "Chat", and "Profile" are always visible.

## 3. Marketplace & Order Logic

### 3.1 Pricing & Checkout (`app/student/checkout.tsx`)
-   **Platform Fee:** The app calculates a **10% platform fee** on top of the service's `basePrice`.
-   **Total Calculation:** `Total = Base Price + (Base Price * 0.10)`.
-   **Order Sequence:**
    1.  Create the order record via `POST /api/Orders`.
    2.  Simulate/Process payment via `POST /api/Payments/{orderId}`.
    3.  Redirect to `payment-result` upon success.

### 3.2 Service Discovery
-   Services are filtered by category via the `catalogSlice`.
-   The UI supports horizontal scrolling for top categories and a grid for popular services.

## 4. Executor Onboarding (KYC Logic)

### 4.1 Submission Workflow (`app/executor/kyc-submit.tsx`)
-   **Validation:** Requires 14-digit National ID, valid phone, and two image files (Front/Back ID).
-   **Multi-part Upload:** Images are handled using `FormData` to allow binary transmission to the backend.

### 4.2 Status Management (`app/executor/kyc-status.tsx`)
-   **State Mapping:**
    -   `Approved`: Displays success UI; grants access to executor features.
    -   `Rejected`: Displays rejection reason; allows re-submission.
    -   `Pending`: Blocks executor features until admin approval.
-   **Simulation:** A debug button allows developers to force `isExecutor = true` for UI testing.

## 5. Real-Time Communication Logic

### 5.1 SignalR Integration (`app/shared/chat/[id].tsx`)
-   **Hub Connection:** Uses `@microsoft/signalr` to connect to `/hubs/chat`.
-   **Room Management:** Calls `JoinChat(chatId)` or `JoinChat("ticket-" + ticketId)` upon screen focus to scope messages.
-   **Live Updates:** When `ReceiveMessage` is triggered from the server, the app dispatches `addLocalMessage` to update the Redux state instantly without a full reload.

### 5.2 Multi-Format Attachments
-   **Image Picking:** Uses `expo-image-picker`.
-   **Voice Notes:** Uses `expo-av` for high-quality recording.
-   **Binary Handling:** All attachments are sent as `IFormFile` via `FormData` in the `sendMessage` thunk.

## 6. Support & Dispute Logic

### 6.1 Ticket Lifecycle
-   Students/Executors open tickets via `shared/support/new-ticket`.
-   Tickets can optionally reference an `OrderId` for dispute mediation.
-   Communication within a ticket follows the same real-time logic as standard chat but targets the support hub group.

## 7. Global Utilities

### 7.1 API Fetch Wrapper (`services/api.ts`)
-   **Environment Switching:** Automatically toggles between `10.0.2.2` (Android Emulator), `localhost` (iOS Simulator), and the Cloudflare Tunnel URL.
-   **Content-Type Logic:** Automatically deletes the `Content-Type` header when sending `FormData` to allow the browser to set the correct boundary, ensuring file uploads don't fail.

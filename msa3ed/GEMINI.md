# GEMINI.md - Project Context: UIS (University Interface System)

This document provides essential context and instructions for the UIS project, a platform connecting students with service executors for university-related tasks.

## 🚀 Project Overview
UIS is a multi-role platform (Student and Executor) designed for university services. It includes a mobile application for users and a backend API for management and data persistence.

- **Frontend:** A cross-platform mobile application built with **Expo (React Native)**.
- **Backend:** A functional **ASP.NET Core 10.0 Web API** using **PostgreSQL** and **SignalR**.
- **Admin Panel:** An MVC application integrated into the ASP.NET Core project for platform management.

## 📂 Directory Structure
- `/UIS`: The Expo mobile application source code.
  - `/UIS/app`: Uses Expo Router for file-based navigation.
    - `/(auth)`: Login, Register, OTP, Forgot Password.
    - `/student`: Unified tab-based navigation and screens for both Students and Executors.
    - `/executor`: KYC submission and status screens.
    - `/shared`: Shared screens (Chat, Orders details, Support tickets, Settings).
  - `/UIS/context`: React Context for state management (AuthContext).
- `/server`: The ASP.NET Core backend source code.
  - `/server/Controllers`: API Controllers (Users, Services, Orders, etc.) and MVC `AdminController`.
  - `/server/Services`: Business logic and data access (EF Core).
  - `/server/Models`: Entity Framework Data Models.
  - `/server/DTOs`: Data Transfer Objects for API requests/responses.
  - `/server/Views`: Razor Views for the Admin Dashboard.
  - `/server/Hubs`: SignalR real-time hubs (`ChatHub`).
- `prd.txt`: Detailed Product Requirements Document (in Arabic).

## 🛠️ Tech Stack
### Frontend (Mobile)
- **Framework:** Expo (SDK 54) / React Native
- **Routing:** Expo Router (File-based navigation)
- **Language:** TypeScript
- **Styling/UI:** Vanilla React Native `StyleSheet`, `expo-linear-gradient`, `expo-blur`.
- **Animations:** `react-native-reanimated`.
- **Icons:** `@expo/vector-icons` (Ionicons).

### Backend
- **Framework:** ASP.NET Core 10.0 (Web API + MVC)
- **Database:** PostgreSQL with Entity Framework Core 10
- **Real-time:** SignalR (for Chat)
- **Auth:** JWT with Email-based OTP logic (Real email sending via MailKit using fps60y@gmail.com)
- **Auth:** JWT with Email-based OTP logic (Real email sending via MailKit using fps60y@gmail.com with a modern, responsive HTML template)

## 🏃 Getting Started

### Frontend (UIS)
1. Navigate to the `UIS` directory:
   ```bash
   cd UIS
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```

**Current State:**
All screens for both Student and Executor roles have been implemented according to the PRD. The unified frontend uses `isExecutor` state for Role-Based conditional rendering.
The ASP.NET Core backend has been updated to include all necessary REST API endpoints mapping directly to the frontend screens (Auth, Users/Me, Services, Orders, Payments, Chat, Tickets, KYC).
The system now fully supports `multipart/form-data` uploads for `Services` (images) and `Chat`/`Tickets` (images, files, voice notes).
The frontend has been completely integrated with the backend using Redux Toolkit. All static dummy data (`dummyData.ts`) has been removed and replaced with dynamic data fetched via `apiFetch` within Redux slices (`authSlice`, `catalogSlice`, `ordersSlice`, `chatSlice`, `ticketsSlice`, `kycSlice`).
The Auth workflow is fully functional with real email OTP verification, featuring a modern responsive email template and improved mobile UI (auto-passing email to verify screen, OTP timer, etc.).

### Backend (server)
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Start the PostgreSQL database via Docker:
   ```bash
   docker-compose up -d
   ```
3. Run Entity Framework Core migrations (ensure `dotnet-ef` tool is installed):
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```
4. Start the ASP.NET Core API and Admin Panel:
   ```bash
   dotnet run
   ```
   *The server will start (default is typically `http://localhost:5035` or `http://localhost:5000`).*

**🔑 Default Credentials & URLs:**
- **Admin Panel URL:** `http://localhost:5035/Admin`
- **Admin Account:** `admin@uis.com`
- **Admin Password:** `admin123`
*(Note: Roles for `Student` and `Executor` are also pre-seeded).*

**Current State:**
- The ASP.NET Core Web API + MVC project is fully implemented.
- `docker-compose.yml` is set up with PostgreSQL and pgAdmin.
- `Dockerfile` is ready for deployment.
- Entity Framework Core models (`User`, `Role`, `Permission`, `Order`, `Service`, `Chat`, `Ticket`, `KycRequest`, etc.) are mapped and seeded with comprehensive dummy data.
- JWT Authentication, Email-based OTP, and SignalR (`ChatHub`) are configured.
- The Admin Panel (MVC) is fully functional with dashboards, user management, order tracking, KYC approvals, and role/permission management.
- The Web API endpoints are complete for the mobile application.

## 🌐 Backend API Endpoints

The ASP.NET Core backend exposes the following REST API endpoints for the mobile application. All authenticated routes require a valid JWT token in the `Authorization: Bearer <token>` header.

### 🔐 Authentication (`/api/Auth`)
- `POST /login` - Authenticate a user and trigger an OTP email.
- `POST /register` - Register a new user (defaults to 'Student' role).
- `POST /verify-otp` - Verify the OTP and return user details (`id`, `name`, `email`, `isExecutor`, `roles`).

### 👤 Users (`/api/Users`)
- `GET /Me` **[Auth]** - Fetch the current authenticated user's profile and roles.

### 🛍️ Catalog (`/api/Services`, `/api/Categories`)
- `GET /api/Services` - Fetch all active services.
- `GET /api/Services/{id}` - Fetch a specific service by ID.
- `GET /api/Categories` - Fetch all service categories.

### 📦 Orders (`/api/Orders`)
- `GET /` **[Auth]** - Get all orders related to the current user (Student or Executor).
- `GET /Available` - Get all pending orders available for executors to accept.
- `GET /{id}` **[Auth]** - Get details of a specific order.
- `POST /` **[Auth]** - Create a new order for a service.

### 💳 Payments (`/api/Payments`)
- `POST /{orderId}` - Process a payment for a specific order.

### 💬 Chat (`/api/Chat`)
- `GET /Order/{orderId}` **[Auth]** - Retrieve chat history for a specific order.
- `POST /{chatId}/Message` **[Auth]** - Send a new message in a chat.

### 🎫 Support Tickets (`/api/Ticket`)
- `GET /` **[Auth]** - Retrieve all support tickets for the current user.
- `GET /{id}` **[Auth]** - Get details and messages of a specific ticket.
- `POST /` **[Auth]** - Open a new support ticket.

### 🛡️ KYC Verification (`/api/Kyc`)
- `GET /Status` **[Auth]** - Get the current user's KYC submission status (Pending, Approved, Rejected).
- `POST /Submit` **[Auth]** - Submit national ID and phone number for Executor verification.

## 📐 Development Conventions
- **Routing:** Use file-based routing in `UIS/app/`. Group authenticated routes in `(auth)` and tab-based navigation in `(tabs)`.
- **Roles & Permissions:** Users are registered as Students by default. If they want to switch to an Executor, they must verify their KYC first. The `isExecutor` boolean flag (defaulting to `false`) in the User model and `AuthContext` dictates access to Executor features. Once KYC is approved, they gain access to Executor tabs alongside Student features.
- **Styling:** Centralize colors in `UIS/constants/Colors.ts`.
- **Language:** The UI is primarily in Arabic, catering to the target audience.

## 📋 Key Features (from PRD)
- **Student Role:** Browse services, create orders, chat with executors, pay via Paymob, track order status.
- **Executor Role:** KYC submission, browse available orders, execute and deliver files, manage earnings.
- **Common:** Authentication (Login/Register/OTP), Direct & Order Chat, Support Tickets.

## 🛑 Important Notes
- **Do not create two separate apps.** Use a single Role-Based Expo app.
- Monolith First: Start with a clean Monolith architecture for the backend before considering Microservices.
- Security: Use JWT for authentication and HMAC for payment validation.

## 📊 System State Snapshot

### 🌐 Network & Access
- **Backend Port:** 5035
- **Local URL:** `http://localhost:5035` (or `http://10.0.2.2:5035` for Android Emulator)

### 📧 SMTP Configuration
- **Server:** `smtp.gmail.com:587`
- **User:** `fps60y@gmail.com`
- **Status:** Dynamic management enabled via Admin Panel.

### 🏁 Task Status
1. [DONE] Map API endpoints and seed database.
2. [DONE] Implement File/Voice attachments for chat/tickets (Send & Receive).
3. [DONE] Configure SMTP OTP with professional templates.
4. [DONE] Setup Public Access via Cloudflare Tunnel.
5. [DONE] Synchronize Service model (Rating, Delivery Time, Reviews).
6. [DONE] Implement dynamic Email/SMTP settings in Admin Panel.
7. [DONE] Integrate SignalR for real-time chat and support tickets.
8. [DONE] Adapt frontend features and map fields perfectly to the backend API (Reset password, Profile data, Orders, Earnings).
9. [SKIPPED] Implement Paymob integration for student payments (Payment bypass logic implemented for now).


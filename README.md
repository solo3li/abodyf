# UIS (University Interface System) 🎓

UIS is a comprehensive, multi-role platform designed to bridge the gap between university students and service executors. It provides a secure and efficient marketplace for academic-related services, featuring real-time communication, a robust escrow payment system, and identity verification.

---

## 🚀 Key Features

### 👤 Student Role (Default)
- **Browse & Search:** Explore various service categories (Content Writing, Data Analysis, etc.).
- **Order Management:** Create service requests, track status, and manage active orders.
- **Secure Payments:** Integrated payment flow with an escrow system that protects funds until delivery.
- **Real-Time Communication:** Direct chat with executors and order-specific chat for project updates.
- **Support Tickets:** Open tickets for inquiries or dispute resolution.

### 👨‍💻 Executor Role (Upgraded)
- **KYC Verification:** Simple identity verification process (National ID & Phone) to unlock executor capabilities.
- **Available Orders:** Browse and accept pending service requests from students.
- **Delivery System:** Securely deliver work via the chat system with support for documents, images, and voice notes.
- **Earnings Dashboard:** Track completed orders and total earnings.

### 🛠️ Admin Dashboard (MVC Panel)
- **System Overview:** Real-time statistics on users, orders, and financial transactions.
- **User Management:** Full control over users, roles, and permissions.
- **KYC Review:** Dedicated interface for approving or rejecting executor applications.
- **Order & Dispute Resolution:** Ability to intervene in orders and resolve support tickets.
- **Dynamic Configuration:** Manage system settings, email templates, and SMTP configurations on the fly.

---

## 🛠️ Technical Stack

### **Frontend (Mobile)**
- **Framework:** Expo (SDK 54) / React Native
- **Navigation:** Expo Router (File-based navigation)
- **State Management:** Redux Toolkit (API Integration)
- **Styling:** Vanilla React Native `StyleSheet` with `expo-linear-gradient` and `expo-blur`.
- **Real-time:** SignalR Client for instant messaging and notifications.

### **Backend (Server)**
- **Framework:** ASP.NET Core 10.0 (Web API + MVC Admin Panel)
- **Database:** PostgreSQL with Entity Framework Core 10
- **Authentication:** JWT with Email-based OTP (Multi-role RBAC)
- **Real-time:** SignalR Hubs for Chat and Ticket systems.
- **Infrastructure:** Docker Compose (PostgreSQL & pgAdmin)

---

## 🧠 Business Logic

### 🔐 1. Authentication & Security
- **OTP Workflow:** Every login/registration triggers a 4-digit OTP sent to the user's email using a modern, responsive HTML template.
- **RBAC:** A sophisticated Role-Based Access Control system allows a single account to hold multiple roles (e.g., Student + Executor).
- **JWT:** Secure token-based authentication for all API interactions.

### 🛡️ 2. Executor Verification (KYC)
- Users apply for the "Executor" role by submitting their National ID and phone number.
- Administrators review documents via the Admin Panel.
- Upon approval, the `IsExecutor` flag is set, and the user gains access to the Executor workspace.

### 📦 3. Order & Escrow Lifecycle
1. **Creation:** Student creates an order for a specific service.
2. **Payment:** Funds are transferred to a secure **Escrow** account.
3. **Acceptance:** The order becomes visible to Executors, who can "Accept" it.
4. **Execution:** Real-time collaboration occurs via order-linked chat.
5. **Delivery & Settlement:** Once work is delivered and confirmed, funds are released from Escrow to the Executor's balance.

### 💬 4. Communication System
- **Multi-Format Attachments:** The system supports uploading and receiving images, documents, and voice notes.
- **SignalR Integration:** Messages are delivered instantly without requiring page refreshes or manual polling.

---

## 🌐 API Endpoints

### 🔐 Authentication (`/api/Auth`)
- `POST /login` - Initiate login and send OTP.
- `POST /register` - Register a new student account.
- `POST /verify-otp` - Validate OTP and receive full user profile + JWT.

### 👤 User Management (`/api/Users`)
- `GET /Me` - Get current user's profile and roles.

### 🛍️ Service Catalog
- `GET /api/Categories` - List all available service categories.
- `GET /api/Services` - List all active services.
- `GET /api/Services/{id}` - Get detailed service information.

### 📦 Order Management (`/api/Orders`)
- `GET /` - List orders for the current user.
- `GET /Available` - List pending orders for executors.
- `POST /` - Create a new order.
- `GET /{id}` - Get order details.

### 💳 Payments & Earnings (`/api/Payments`)
- `POST /{orderId}` - Process payment for an order.
- `GET /Earnings` - (Executor) View total earnings and transaction history.

### 💬 Communication (`/api/Chat`)
- `GET /Order/{orderId}` - Get chat history for a specific order.
- `GET /Private/{userId}` - Get private conversation history.
- `POST /{chatId}/Message` - Send message (Supports `multipart/form-data` for attachments).

### 🎫 Support (`/api/Ticket`)
- `GET /` - List all support tickets for the user.
- `POST /` - Open a new support ticket.
- `GET /{id}` - Get ticket details and replies.
- `POST /{id}/Reply` - Send a reply to a ticket.

### 🛡️ Verification (`/api/Kyc`)
- `GET /Status` - Check current KYC submission status.
- `POST /Submit` - Submit identity documents for verification.

---

## 🏃 Getting Started

### **Backend Setup**
1. Navigate to `/server`.
2. Start the database: `docker-compose up -d`.
3. Apply migrations: `dotnet ef database update`.
4. Run the server: `dotnet run`.
5. Access Admin Panel at: `http://localhost:5035/Admin` (Admin: `admin@uis.com` / `admin123`).

### **Frontend Setup**
1. Navigate to `/UIS`.
2. Install dependencies: `npm install`.
3. Start Expo: `npx expo start`.

---

## 📂 Project Structure
- `UIS/`: React Native (Expo) mobile application.
- `server/`: ASP.NET Core backend & Admin Panel.
- `msa3ed/`: Deployment scripts and project documentation.
- `Uis.Tests/`: Backend unit tests.

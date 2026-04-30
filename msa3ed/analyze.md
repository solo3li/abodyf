# Project Analysis: UIS (University Interface System)

## 1. Executive Summary
The UIS project is a comprehensive digital marketplace designed to connect university students with service executors for academic and administrative tasks. It features a cross-platform mobile application (Expo) and a robust backend (ASP.NET Core 10) with an integrated administrative dashboard.

## 2. Technical Architecture

### 2.1 Backend (server/)
- **Framework:** ASP.NET Core 10.0 (Web API + MVC).
- **Database:** PostgreSQL managed via Entity Framework Core 10.
- **Real-time Communication:** SignalR for instant messaging and notifications.
- **Authentication:** JWT (JSON Web Tokens) with a custom Email OTP workflow.
- **Infrastructure:** Containerized with Docker and Docker Compose.
- **Key Services:**
  - `AuthService`: Handles registration, login, and OTP verification.
  - `CatalogService`: Manages service categories and marketplace listings.
  - `OrderService`: Orchestrates the lifecycle of an order from creation to completion.
  - `PaymentService` & `EscrowService`: Handles financial transactions and fund protection.
  - `ChatService` & `TicketService`: Manages real-time communication and support.

### 2.2 Frontend (UIS/)
- **Framework:** Expo SDK 54 (React Native).
- **Navigation:** Expo Router (File-based navigation).
- **State Management:** Redux Toolkit for global data (Auth, Catalog, Orders, Chat, Tickets) and React Context for Auth state.
- **UI/UX:**
  - `vanilla` React Native StyleSheet.
  - `expo-linear-gradient` and `expo-blur` for modern aesthetics.
  - `react-native-reanimated` for smooth transitions.
  - `expo-image-picker` for file uploads.
- **Real-time:** `@microsoft/signalr` client for chat.

## 3. Core Data Models
| Entity | Description |
| :--- | :--- |
| **User** | Central entity supporting multiple roles (Student, Executor, Admin). |
| **KycRequest** | Identity verification for executors (National ID, Phone). |
| **Service** | Marketplace listings with pricing, rating, and delivery time. |
| **Order** | Tracks transactions between Students and Executors. |
| **Escrow** | Protects funds until service delivery is confirmed. |
| **Chat/Message** | Real-time communication between users. |
| **Ticket** | Support and dispute resolution mechanism. |

## 4. Key Workflows

### 4.1 Authentication & Onboarding
1. User registers or logs in via email.
2. System sends a professional HTML email with an OTP (via MailKit).
3. User verifies OTP to receive a JWT token.
4. Default role is "Student".

### 4.2 Service Fulfillment
1. **Student:** Browses categories -> selects service -> creates order -> pays via Paymob (Pending integration).
2. **Executor:** Views available orders -> accepts order -> communicates via chat -> delivers work.
3. **Escrow:** Funds are held in escrow and released upon student approval or administrative intervention.

### 4.3 Executor Verification (KYC)
1. Student submits KYC (National ID Front/Back, Phone).
2. Admin reviews the request in the Dashboard.
3. Upon approval, the `IsExecutor` flag is set to `true`, and the "Executor" role is granted.

## 5. Administrative Capabilities
The MVC-based Admin Panel provides full control over:
- **Dashboards:** Financial and user activity overviews.
- **User Management:** Role and permission assignment.
- **Order & Payment Tracking:** Monitoring the escrow system.
- **KYC Approval:** Manual verification of service providers.
- **Service Catalog:** Dynamic management of categories and offerings.
- **System Settings:** Real-time configuration of SMTP and other global parameters.

## 6. Detailed Backend API Analysis

### 6.1 Authentication (`/api/Auth`)
| Endpoint | Method | Parameters | Scenario |
| :--- | :--- | :--- | :--- |
| `/login` | POST | `Email, Password` | **Success:** Returns temp JWT, triggers OTP email. **Fail:** 401 Unauthorized. |
| `/register` | POST | `FullName, Email, Password, University, Major` | **Success:** Creates user (Student role). **Fail:** 400 (e.g., email exists). |
| `/verify-otp` | POST | `Email, Code` | **Success:** Validates OTP, returns full User DTO + Roles. **Fail:** 400 Invalid/Expired. |
| `/forgot-password`| POST | `Email` | **Success:** Generates OTP for reset. **Fail:** 404 User not found. |
| `/reset-password` | POST | `Email, Code, NewPassword` | **Success:** Updates password in DB. **Fail:** 400 Invalid OTP. |

### 6.2 User Management & Stats (`/api/Users`)
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/Me` | GET | Yes | Retrieves authenticated user profile, roles, and stats (Rating, Completed Orders). |

### 6.3 Marketplace Catalog (`/api/Services`, `/api/Categories`)
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/Services` | GET | No | List active services with Category name, ImageUrl, and rating. |
| `/Services/{id}`| GET | No | Detailed service view. |
| `/Categories` | GET | No | Returns list of all categories. |

### 6.4 Order Lifecycle (`/api/Orders`)
| Endpoint | Method | Auth | Scenario |
| :--- | :--- | :--- | :--- |
| `/` | GET | Yes | Fetches orders for both Student and Executor perspectives. |
| `/Available` | GET | Yes | **Executor Only:** Returns orders with `Pending` status. |
| `/` | POST | Yes | **Order Creation:** Initiates a new service request. Status defaults to `Pending`. |
| `/{id}` | GET | Yes | Detailed order tracking. |

### 6.5 Financials & Earnings (`/api/Payments`)
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/{orderId}` | POST | Yes | Manual payment simulation (Sets status to Paid/Pending). |
| `/Earnings` | GET | Yes | **Executor Only:** Summary of completed order payments and transaction history. |

### 6.6 Real-time Messaging (`/api/Chat`)
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/Order/{id}` | GET | Yes | Retrieves or creates a chat session for a specific order. |
| `/Private/{id}`| GET | Yes | Retrieves or creates a DM between two users. |
| `/{id}/Message`| POST | Yes | **Multi-part Upload:** Sends text/file/voice. Broadcasts via SignalR `ChatHub`. |

### 6.7 Support System (`/api/Ticket`)
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/` | GET | Yes | List user's support history. |
| `/` | POST | Yes | Open a new ticket with a subject. |
| `/{id}/Reply` | POST | Yes | Multi-part attachment support for ticket communication. |

### 6.8 KYC Verification (`/api/Kyc`)
| Endpoint | Method | Auth | Scenario |
| :--- | :--- | :--- | :--- |
| `/Status` | GET | Yes | Checks current submission state (`Pending`, `Approved`, `Rejected`). |
| `/Submit` | POST | Yes | **KYC Submission:** Accepts `NationalIdFront`, `NationalIdBack` (files) and phone. |

## 7. Business Scenarios & State Transitions

### 7.1 The "Executor" Onboarding
- **Trigger:** Student submits `/api/Kyc`.
- **Admin Action:** Dashboard -> Review KYC -> `ApproveKyc`.
- **System Change:** User `IsExecutor` set to `true`, "Executor" role added, Notification sent via `INotificationService`.

### 7.2 Order Fulfillment & Escrow
- **Payment:** Student pays -> `Payment` status `Completed` -> `Escrow` status `Held`.
- **Execution:** Order status moves from `Pending` -> `InProgress` (via Admin/Acceptance).
- **Completion:** Deliverables sent via Chat -> Admin/Student confirms -> `ResolveDispute(release)`.
- **Settlement:** `Escrow` status `Released` -> Funds added to Executor's `/api/Payments/Earnings`.

### 7.3 Real-time Hub Topology (`ChatHub`)
- **Transport:** WebSockets/SignalR.
- **Groups:**
  - `chatId` for Order/Private chats.
  - `ticket-ticketId` for support communication.
- **Integration:** Controllers manually trigger `IHubContext.Clients.Group().SendAsync()` for guaranteed delivery.

## 8. Current Implementation Status
- [x] Full Backend API & Database Seeding.
- [x] MVC Admin Panel with all management views.
- [x] Mobile Frontend with Unified Navigation.
- [x] Real-time Chat & Support Tickets (SignalR).
- [x] File and Voice Note attachments support.
- [x] SMTP OTP workflow with modern templates.
- [x] Redux Toolkit integration.
- [ ] Final Paymob Payment Gateway integration.

## 9. Strategic Recommendations
- **Deployment:** Containerize for production using provided `Dockerfile`.
- **Security:** Ensure `JwtSettings:Secret` is rotated and stored in Environment Variables.
- **Scaling:** Use Redis backplane for SignalR if scaling horizontally.

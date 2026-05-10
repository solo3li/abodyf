# UIS (University Interface System) 🎓

## 🚀 Project Overview

UIS is a comprehensive, multi-role platform designed to bridge the gap between university students and service executors. It provides a secure and efficient marketplace for academic-related services, featuring real-time communication, a robust escrow payment system, and identity verification.

The project is structured as a Monolith with two main applications:
- **Frontend:** A cross-platform mobile application built with **Expo (React Native)** for both Students and Executors.
- **Backend:** An **ASP.NET Core 10.0 Web API** using **PostgreSQL/SQLite** and **SignalR**, which also includes an MVC Admin Panel for platform management.

## 📂 Directory Structure

- `/UIS`: The Expo mobile application source code (React Native, TypeScript).
  - Uses Expo Router for file-based navigation (`/app`).
  - Unified app for both Student and Executor roles based on state (`isExecutor`).
- `/server`: The ASP.NET Core backend source code (C#).
  - Contains API Controllers, MVC Admin Panel Views, Entity Framework models, and SignalR Hubs.
- `/Uis.Tests`: Backend unit tests.
- `/msa3ed`: Deployment scripts, Python tools, and project documentation (`prd.txt`).

## 🛠️ Tech Stack

### Frontend (Mobile)
- **Framework:** Expo (SDK 54) / React Native
- **Language:** TypeScript
- **Navigation:** Expo Router
- **State Management:** Redux Toolkit
- **Real-time:** SignalR Client
- **Styling:** Vanilla React Native `StyleSheet`

### Backend (Server)
- **Framework:** ASP.NET Core 10.0 (Web API + MVC Admin Panel)
- **Database:** PostgreSQL (production) / SQLite (development) with Entity Framework Core 10
- **Authentication:** JWT with Email-based OTP
- **Real-time:** SignalR Hubs
- **Infrastructure:** Docker Compose

## 🏃 Getting Started

### **Backend Setup (`/server`)**
1. Navigate to the `server` directory: `cd server`
2. Start the database using Docker: `docker-compose up -d`
3. Apply Entity Framework migrations: `dotnet ef database update`
4. Run the server: `dotnet run`
5. The Admin Panel is accessible at `http://localhost:5035/Admin` (Default Admin: `admin@uis.com` / `admin123`).

### **Frontend Setup (`/UIS`)**
1. Navigate to the `UIS` directory: `cd UIS`
2. Install dependencies: `npm install`
3. Start Expo: `npx expo start`

## 📐 Development Conventions & Architecture

- **Role-Based Access Control (RBAC):** Users register as Students by default. To become an Executor, they must submit KYC documents (National ID, Phone). The `isExecutor` flag controls access to Executor-specific features in the app.
- **Routing:** Use file-based routing in `UIS/app/`. Group authenticated routes logically (e.g., `(auth)`, `student`, `executor`, `shared`).
- **Styling:** Centralize colors in `UIS/constants/Colors.ts`. The primary UI language is Arabic.
- **Security:** Use JWT for authentication. All API routes requiring authentication must include the `Authorization: Bearer <token>` header.
- **Real-time Communication:** SignalR is used heavily for Chat and Support Tickets. Both systems support `multipart/form-data` uploads for images, documents, and voice notes.
- **Monolith First:** Maintain the current Monolith architecture in the ASP.NET backend before considering any Microservices migration.

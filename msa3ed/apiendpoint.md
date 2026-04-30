# 🌐 UIS API Endpoints Documentation & Tests

This document contains a comprehensive list of all backend REST API endpoints available in the UIS platform, along with their testing details using `curl`. 

**Base URL:** `https://transmit-cambridge-plus-colon.trycloudflare.com/api`

---

## 🔐 Authentication (`/api/Auth`)

### 1. Login
Authenticates a user and triggers an OTP email. Returns a JWT Token.
* **Endpoint:** `POST /api/Auth/login`
* **Curl Command:**
  ```bash
  curl -X POST https://transmit-cambridge-plus-colon.trycloudflare.com/api/Auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"student1@uis.com", "password":"pass123"}'
  ```
* **Sample Response:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "message": "OTP sent."
  }
  ```

### 2. Verify OTP
Verifies the OTP and returns the user details.
* **Endpoint:** `POST /api/Auth/verify-otp`
* **Curl Command:**
  ```bash
  curl -X POST https://transmit-cambridge-plus-colon.trycloudflare.com/api/Auth/verify-otp \
       -H "Content-Type: application/json" \
       -d '{"email":"student1@uis.com", "code":"1234"}'
  ```
* **Sample Response:**
  ```json
  {
    "id": "510145fa-e233-4b9b-91ba-dfe3c750870e",
    "name": "طالب رقم 1",
    "email": "student1@uis.com",
    "isExecutor": false,
    "roles": ["Student"]
  }
  ```

### 3. Register
Registers a new user (defaults to 'Student' role).
* **Endpoint:** `POST /api/Auth/register`
* **Curl Command:**
  ```bash
  curl -X POST https://transmit-cambridge-plus-colon.trycloudflare.com/api/Auth/register \
       -H "Content-Type: application/json" \
       -d '{"email":"new_user@uis.com", "password":"pass123", "fullName":"مستخدم جديد"}'
  ```
* **Sample Response:**
  ```text
  User registered.
  ```

---

## 👤 Users (`/api/Users`)

### 1. Get Current User Profile (Me)
Fetches the current authenticated user's profile and roles.
* **Endpoint:** `GET /api/Users/Me`
* **Headers:** `Authorization: Bearer <token>`
* **Curl Command:**
  ```bash
  curl -X GET https://transmit-cambridge-plus-colon.trycloudflare.com/api/Users/Me \
       -H "Authorization: Bearer <token>"
  ```
* **Sample Response:**
  ```json
  {
    "id": "510145fa-e233-4b9b-91ba-dfe3c750870e",
    "fullName": "طالب رقم 1",
    "email": "student1@uis.com",
    "isExecutor": false,
    "isAdmin": false,
    "roles": ["Student"]
  }
  ```

---

## 🛍️ Catalog (`/api/Services`, `/api/Categories`)

### 1. Get All Categories
Fetches all service categories.
* **Endpoint:** `GET /api/Categories`
* **Curl Command:**
  ```bash
  curl -X GET https://transmit-cambridge-plus-colon.trycloudflare.com/api/Categories
  ```
* **Sample Response:**
  ```json
  [
    {
      "id": "2592f4d9-1f09-4952-8be4-2f22a013ef2f",
      "name": "كتابة محتوى"
    }
  ]
  ```

### 2. Get All Services
Fetches all active services.
* **Endpoint:** `GET /api/Services`
* **Curl Command:**
  ```bash
  curl -X GET https://transmit-cambridge-plus-colon.trycloudflare.com/api/Services
  ```
* **Sample Response:**
  ```json
  [
    {
      "id": "0340491d-ddd6-4a09-ae5f-74f8f6f5df77",
      "title": "تحليل بيانات - خدمة رقم 3",
      "description": "وصف تفصيلي لخدمة تحليل بيانات المتميزة رقم 3.",
      "basePrice": 111,
      "categoryName": "تحليل بيانات",
      "categoryId": "ab13a247-6e25-41e3-8c0e-066abc87aaae",
      "imageUrl": "/uploads/sample-image.jpg"
    }
  ]
  ```

### 3. Get Service By ID
Fetches a specific service by ID.
* **Endpoint:** `GET /api/Services/{id}`
* **Curl Command:**
  ```bash
  curl -X GET https://transmit-cambridge-plus-colon.trycloudflare.com/api/Services/0340491d-ddd6-4a09-ae5f-74f8f6f5df77
  ```
* **Sample Response:**
  ```json
  {
    "id": "0340491d-ddd6-4a09-ae5f-74f8f6f5df77",
    "title": "تحليل بيانات - خدمة رقم 3",
    "description": "وصف تفصيلي لخدمة تحليل بيانات المتميزة رقم 3.",
    "basePrice": 111,
    "categoryName": "تحليل بيانات",
    "categoryId": "ab13a247-6e25-41e3-8c0e-066abc87aaae",
      "imageUrl": "/uploads/sample-image.jpg"
  }
  ```

---

## 📦 Orders (`/api/Orders`)

### 1. Get My Orders
Get all orders related to the current user (Student or Executor).
* **Endpoint:** `GET /api/Orders`
* **Headers:** `Authorization: Bearer <token>`
* **Curl Command:**
  ```bash
  curl -X GET https://transmit-cambridge-plus-colon.trycloudflare.com/api/Orders \
       -H "Authorization: Bearer <token>"
  ```
* **Sample Response:**
  ```json
  [
    {
      "id": "c68cf7bc-f247-4ba1-bffe-5c97836311d0",
      "status": "Pending",
      "price": 150,
      "createdAt": "2026-04-28T23:57:05.305627Z",
      "serviceTitle": "تحليل بيانات - خدمة رقم 3",
      "serviceId": "0340491d-ddd6-4a09-ae5f-74f8f6f5df77",
      "studentId": "510145fa-e233-4b9b-91ba-dfe3c750870e",
      "executorId": null
    }
  ]
  ```

### 2. Get Available Orders (For Executors)
Get all pending orders available for executors to accept.
* **Endpoint:** `GET /api/Orders/Available`
* **Headers:** `Authorization: Bearer <token>`
* **Curl Command:**
  ```bash
  curl -X GET https://transmit-cambridge-plus-colon.trycloudflare.com/api/Orders/Available \
       -H "Authorization: Bearer <token>"
  ```

### 3. Create a New Order
Create a new order for a service.
* **Endpoint:** `POST /api/Orders`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Curl Command:**
  ```bash
  curl -X POST https://transmit-cambridge-plus-colon.trycloudflare.com/api/Orders \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{"serviceId":"0340491d-ddd6-4a09-ae5f-74f8f6f5df77", "price":150}'
  ```

### 4. Get Order By ID
Get details of a specific order.
* **Endpoint:** `GET /api/Orders/{id}`
* **Headers:** `Authorization: Bearer <token>`
* **Curl Command:**
  ```bash
  curl -X GET https://transmit-cambridge-plus-colon.trycloudflare.com/api/Orders/c68cf7bc-f247-4ba1-bffe-5c97836311d0 \
       -H "Authorization: Bearer <token>"
  ```

---

## 💳 Payments (`/api/Payments`)

### 1. Process Payment
Process a payment for a specific order.
* **Endpoint:** `POST /api/Payments/{orderId}`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Curl Command:**
  ```bash
  curl -X POST https://transmit-cambridge-plus-colon.trycloudflare.com/api/Payments/c68cf7bc-f247-4ba1-bffe-5c97836311d0 \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '150'
  ```
* **Sample Response:**
  ```json
  {
    "success": true
  }
  ```

---

## 💬 Chat (`/api/Chat`)

### 1. Get Order Chat
Retrieve chat history for a specific order.
* **Endpoint:** `GET /api/Chat/Order/{orderId}`
* **Headers:** `Authorization: Bearer <token>`
* **Curl Command:**
  ```bash
  curl -X GET https://transmit-cambridge-plus-colon.trycloudflare.com/api/Chat/Order/c68cf7bc-f247-4ba1-bffe-5c97836311d0 \
       -H "Authorization: Bearer <token>"
  ```

### 2. Get Private Chat
Retrieve chat history between the current user and another specific user.
* **Endpoint:** `GET /api/Chat/Private/{userId}`
* **Headers:** `Authorization: Bearer <token>`
* **Curl Command:**
  ```bash
  curl -X GET https://transmit-cambridge-plus-colon.trycloudflare.com/api/Chat/Private/510145fa-e233-4b9b-91ba-dfe3c750870e \
       -H "Authorization: Bearer <token>"
  ```

### 3. Send Chat Message (with optional attachment)
Send a new message in a chat. Supports `multipart/form-data` for file, image, or voice uploads.
* **Endpoint:** `POST /api/Chat/{chatId}/Message`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Curl Command (Text only):**
  ```bash
  curl -X POST https://transmit-cambridge-plus-colon.trycloudflare.com/api/Chat/<chatId>/Message \
       -H "Authorization: Bearer <token>" \
       -F "content=Hello, here is my file"
  ```
* **Curl Command (With Attachment):**
  ```bash
  curl -X POST https://transmit-cambridge-plus-colon.trycloudflare.com/api/Chat/<chatId>/Message \
       -H "Authorization: Bearer <token>" \
       -F "content=Please review this document." \
       -F "attachment=@/path/to/file.pdf" \
       -F "attachmentType=file"
  ```
* **Note:** `attachmentType` can be `image`, `file`, or `voice`.

---

## 🎫 Support Tickets (`/api/Ticket`)

### 1. Get My Tickets
Retrieve all support tickets for the current user.
* **Endpoint:** `GET /api/Ticket`
* **Headers:** `Authorization: Bearer <token>`
* **Curl Command:**
  ```bash
  curl -X GET https://transmit-cambridge-plus-colon.trycloudflare.com/api/Ticket \
       -H "Authorization: Bearer <token>"
  ```

### 2. Open New Ticket
Open a new support ticket.
* **Endpoint:** `POST /api/Ticket`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Curl Command:**
  ```bash
  curl -X POST https://transmit-cambridge-plus-colon.trycloudflare.com/api/Ticket \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '"I have a problem with my order"'
  ```

### 3. Get Ticket By ID
Get details and messages of a specific ticket.
* **Endpoint:** `GET /api/Ticket/{id}`
* **Headers:** `Authorization: Bearer <token>`
* **Curl Command:**
  ```bash
  curl -X GET https://transmit-cambridge-plus-colon.trycloudflare.com/api/Ticket/068ae276-da9b-4013-be16-2b4c5185c37d \
       -H "Authorization: Bearer <token>"
  ```

### 4. Reply to Ticket (with optional attachment)
Send a reply to an open ticket. Supports `multipart/form-data` for file, image, or voice uploads.
* **Endpoint:** `POST /api/Ticket/{id}/Reply`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Curl Command (With Attachment):**
  ```bash
  curl -X POST https://transmit-cambridge-plus-colon.trycloudflare.com/api/Ticket/<ticketId>/Reply \
       -H "Authorization: Bearer <token>" \
       -F "content=Here is a screenshot of the issue." \
       -F "attachment=@/path/to/screenshot.png" \
       -F "attachmentType=image"
  ```

---

## 🛡️ KYC Verification (`/api/Kyc`)

### 1. Get KYC Status
Get the current user's KYC submission status.
* **Endpoint:** `GET /api/Kyc/Status`
* **Headers:** `Authorization: Bearer <token>`
* **Curl Command:**
  ```bash
  curl -X GET https://transmit-cambridge-plus-colon.trycloudflare.com/api/Kyc/Status \
       -H "Authorization: Bearer <token>"
  ```
* **Sample Response:**
  ```json
  {
    "status": null,
    "rejectionReason": null
  }
  ```

### 2. Submit KYC
Submit national ID and phone number for Executor verification.
* **Endpoint:** `POST /api/Kyc/Submit`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Curl Command:**
  ```bash
  curl -X POST https://transmit-cambridge-plus-colon.trycloudflare.com/api/Kyc/Submit \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{"nationalId": "29900100000000", "phone": "01000000000"}'
  ```

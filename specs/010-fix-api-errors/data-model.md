# Data Model: fix-api-signalr-errors

This document outlines the relevant entities and relationships for the API and SignalR fixes.

## Entities

### User (Existing)
- `Id`: Guid (Primary Key)
- `WalletBalance`: decimal
- `Transactions`: ICollection<WalletTransaction>

### Order (Existing)
- `Id`: Guid (Primary Key)
- `Status`: string (e.g., "Pending", "InProgress", "Completed")
- `StudentId`: Guid (Foreign Key)
- `ExecutorId`: Guid? (Foreign Key)

### Chat (Existing)
- `Id`: Guid (Primary Key)
- `Type`: Enum (OrderChat, PrivateChat)
- `Messages`: ICollection<Message>
- `StudentId`: Guid?
- `ExecutorId`: Guid?

### Message (Existing)
- `Id`: Guid (Primary Key)
- `ChatId`: Guid (Foreign Key)
- `SentAt`: DateTime
- `Content`: string

## State Transitions

### Order Acceptance
- **Initial State**: `Pending`, `ExecutorId` is null.
- **Action**: `POST /api/Orders/{id}/Accept`
- **Result State**: `InProgress`, `ExecutorId` set to caller's ID.

## Validation Rules

- **Wallet**: Only the authenticated user can view their own wallet balance and transactions.
- **Inbox**: Users only see private chats where they are either the Student or the Executor.
- **SignalR**: Connection must be authenticated via JWT.

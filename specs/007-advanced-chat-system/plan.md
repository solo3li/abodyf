# Implementation Plan: Advanced Chat System

**Branch**: `007-advanced-chat-system` | **Date**: 2026-05-11 | **Spec**: [specs/007-advanced-chat-system/spec.md](spec.md)
**Input**: Feature specification from `/specs/007-advanced-chat-system/spec.md`

## Summary

This feature significantly enhances the communication platform by introducing a dedicated Private Inbox for pre-order negotiations, the ability for Executors to send Custom Offers, rich media file attachments (images, documents), and voice recordings with dynamic visualizers. It builds upon the existing ASP.NET Core backend and React Native frontend, separating private chat real-time traffic from order chats using SignalR, and utilizes local storage for file assets.

## Technical Context

**Language/Version**: C# 11 (.NET 10.0), TypeScript / React Native
**Primary Dependencies**: ASP.NET Core SignalR, Entity Framework Core, Expo (`expo-av`, `expo-document-picker`, `expo-image-picker`)
**Storage**: PostgreSQL (Data), Local File System `wwwroot/uploads` (Media)
**Testing**: xUnit (Backend), Jest (Frontend)
**Target Platform**: iOS / Android (Mobile), Linux (Server)
**Project Type**: Mobile App + Web API Backend
**Performance Goals**: Media uploads < 3s, Chat latency < 500ms, 60fps animations
**Constraints**: 20MB file upload limit, maintain backward compatibility for existing chats

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monolith First**: PASS (Backend is a single ASP.NET Core project)
- **Single Role-Based App**: PASS (Frontend is a unified Expo app)

## Project Structure

### Documentation (this feature)

```text
specs/007-advanced-chat-system/
├── plan.md              # This file
├── research.md          # Technical decisions for features
├── data-model.md        # Database schema updates
├── quickstart.md        # Feature testing guide
├── contracts/           # API and SignalR contracts
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
msa3ed/
├── server/
│   ├── Controllers/Api/ChatController.cs
│   ├── Hubs/
│   │   ├── ChatHub.cs (Existing)
│   │   └── PrivateChatHub.cs (New)
│   ├── Models/AppModels.cs
│   └── Services/ChatService.cs
└── UIS/
    ├── app/student/(tabs)/
    │   └── inbox.tsx (New)
    ├── app/shared/chat/
    │   ├── [id].tsx (Updated)
    │   └── components/ (New Audio/Attachment widgets)
    └── services/
        └── signalr.ts (Update to handle new Hub)
```

**Structure Decision**: Additions to the existing monolith structure. New SignalR hub on the backend, new Inbox tab and chat components on the frontend.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |

# Implementation Plan: Advanced Chat System

**Branch**: `007-advanced-chat-system` | **Date**: 2026-05-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-advanced-chat-system/spec.md`

## Summary

Implement a professional, Fiverr-like advanced chat system featuring a dedicated Private Inbox for pre-order negotiations, Custom Offers with withdrawal capabilities, and rich media support (images, multi-file attachments, and voice messages with waveform visualization). The technical approach leverages SignalR for real-time synchronization, FFmpeg for server-side audio peak extraction, and React Native Reanimated for high-performance UI components.

## Technical Context

**Language/Version**: C# 10.0 (ASP.NET Core), TypeScript (React Native/Expo SDK 54)  
**Primary Dependencies**: EF Core 10, SignalR, FFMpegCore, expo-av, react-native-reanimated  
**Storage**: PostgreSQL (RDS/Local), Local File Storage (`wwwroot/uploads`)  
**Testing**: xUnit (Backend), Jest (Frontend)  
**Target Platform**: iOS, Android, Web (Admin)
**Project Type**: Web API + Mobile App + MVC Admin  
**Performance Goals**: 60fps visualization, <500ms sync latency, <3s audio processing  
**Constraints**: 20MB file limit, cross-platform audio compatibility (AAC/WebM), Offline queuing  
**Scale/Scope**: Unified chat logic for Orders, Private Inbox, and Support Tickets.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I: Library-First** - Logic for audio processing and custom offers will be encapsulated in dedicated service classes (`AudioService`, `OfferService`).
- [x] **Principle II: CLI Interface** - N/A for this web-based feature, but internal tools (seeding) support CLI execution.
- [x] **Principle III: Test-First** - Implementation will start with contract tests for the new Message DTOs and API endpoints.
- [x] **Principle IV: Integration Testing** - Hub connection and message delivery across PrivateChatHub will be validated with integration tests.

## Project Structure

### Documentation (this feature)

```text
specs/007-advanced-chat-system/
├── plan.md              # This file
├── research.md          # Research findings
├── data-model.md        # Data entities and relationships
├── quickstart.md        # Development setup
├── contracts/           # API and Hub contracts
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
msa3ed/server/
├── Controllers/Api/
│   ├── ChatController.cs        # Private Inbox endpoints
│   └── OfferController.cs       # Custom Offer lifecycle
├── Services/
│   ├── IAudioService.cs         # Waveform extraction
│   └── IOfferService.cs         # Offer-to-Order conversion
├── Hubs/
│   └── PrivateChatHub.cs        # Negotiation hub
└── Models/AppModels.cs          # Entity updates

msa3ed/UIS/
├── app/
│   ├── student/inbox/           # Private Inbox tab
│   └── shared/chat/             # Unified chat components
├── components/
│   ├── Waveform.tsx             # Visualization component
│   └── CustomOffer.tsx          # Actionable offer widget
└── store/slices/
    └── chatSlice.ts             # Redux state for advanced chat
```

**Structure Decision**: Hybrid Monolith. Backend logic resides in `msa3ed/server` (Web API + Services), and Frontend logic in `msa3ed/UIS` (React Native/Expo).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |

# Implementation Plan: Rich Chat Media, Admin Service Approval & Advanced Search

**Branch**: `013-rich-chat-media-admin-search` | **Date**: 2026-05-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/013-rich-chat-media-admin-search/spec.md`

## Summary

This feature delivers three parallel tracks of improvement across the UIS platform:

1. **Rich Chat Media**: Extend the existing SignalR chat system to support voice messages with
   live waveform visualizer, pre-send preview (pause/resume/discard/send), inline image/video
   rendering, file attachments, and full admin moderation controls — across iOS, Android, and Web,
   with full RTL/Arabic layout support.

2. **Admin Service Approval**: Gate all new executor service listings behind an admin approval
   queue. Approved services become discoverable; rejected services remain hidden but active orders
   complete. Every approval action is audit-logged.

3. **Advanced Search**: Extend the services discovery endpoint with 7 simultaneous filter
   dimensions and a chip-based filter UI. Improve the Home screen, Inbox, and Admin Executor
   Management with richer data and search capabilities.

## Technical Context

**Language/Version**: C# 10.0 (.NET 10), TypeScript (React Native/Expo SDK 52)
**Primary Dependencies**: EF Core 10, Redux Toolkit, SignalR, expo-av, react-native-reanimated 3, expo-image, expo-document-picker, expo-image-picker
**Storage**: PostgreSQL
**Testing**: Jest (FE), xUnit (BE)
**Target Platform**: iOS, Android, Web (Expo managed workflow + ASP.NET Core)
**Performance Goals**: Media send <5s (30s voice); search results <1s (10k catalog, 7 filters); inbox search <500ms
**Constraints**: Arabic/RTL layout on all new components; existing `Colors.ts` palette; no new auth infrastructure
**Scale/Scope**: ~10k services, ~60 executors, typical inbox <100 conversations per user

## Constitution Check

- [x] **Principle I: Library-First** — Logic encapsulated in `chatSlice`, `searchSlice`, `VoiceRecorder` service, backend services/controllers.
- [x] **Principle II: Clean Architecture** — Extend existing hub/controller/slice pattern; no reflection hacks.
- [x] **Principle III: Test-First, Full-Stack Verification & Feature Completeness** — TDD for all new slice actions, hub methods, controller endpoints; FE (Jest) + BE (xUnit) tests included per story.
- [x] **Principle IV: Integration & Contract Testing** — Contract tests for all 9 new/extended endpoints; SignalR hub method tests included.
- [x] **Principle V: Complete Delivery** — No stubs; every story delivered with passing tests + auto-commit.

## Project Structure

### Documentation (this feature)

```text
specs/013-rich-chat-media-admin-search/
├── plan.md              # This file
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── quickstart.md        # Phase 1 output ✅
├── contracts/
│   └── api-contracts.md # Phase 1 output ✅
└── tasks.md             # Phase 2 output (next: /speckit-tasks)
```

### Source Code

```text
msa3ed/
├── server/              # Backend (ASP.NET Core)
│   ├── Controllers/Api/
│   │   ├── ChatController.cs          # Extend: rich media message handling
│   │   ├── ExecutorServicesController.cs  # Extend: search + approval gate
│   │   └── Admin/
│   │       ├── AdminServicesController.cs # NEW: approve/reject endpoints
│   │       ├── AdminChatController.cs     # NEW: moderation endpoints
│   │       └── AdminExecutorsController.cs # NEW: executor search
│   ├── Hubs/
│   │   └── ChatHub.cs                 # Extend: mute check, MarkRead, MessageDeleted
│   ├── Models/
│   │   └── AppModels.cs               # Extend: Message, Attachment, Service + new models
│   ├── Services/
│   │   ├── VoiceMessageService.cs     # NEW: audio file validation + storage
│   │   ├── ServiceApprovalService.cs  # NEW: approval workflow + notifications
│   │   └── SearchService.cs           # NEW: filter-chain query builder
│   └── Migrations/                    # 8 migrations (M-001 through M-008)
└── UIS/                 # Frontend (React Native/Expo)
    ├── app/student/(tabs)/
    │   ├── chat.tsx                   # Extend: rich media rendering
    │   ├── inbox.tsx                  # Extend: unread counts, media previews, search
    │   └── index.tsx                  # Extend: Home screen offers + projects sections
    ├── app/Admin/
    │   └── index.tsx                  # Extend: service approval queue + chat moderation
    ├── components/
    │   ├── chat/
    │   │   ├── VoiceMessageBubble.tsx # NEW: playback waveform bubble (RTL-aware)
    │   │   ├── VoiceRecorder.tsx      # NEW: recording UI + waveform visualizer (RTL-aware)
    │   │   ├── MediaMessageBubble.tsx # NEW: image/video/file bubble
    │   │   ├── MessageBubble.tsx      # EXTEND: route to correct bubble type
    │   │   └── RetryUploadButton.tsx  # NEW: failed upload retry action
    │   ├── admin/
    │   │   ├── ServiceApprovalCard.tsx # NEW: pending service review card
    │   │   └── ModerationToolbar.tsx  # NEW: flag/delete/mute actions
    │   ├── AdvancedFilterSheet.tsx    # EXTEND: wire up all 7 filter dimensions
    │   ├── FilterChipBar.tsx          # NEW: dismissible chip bar for active filters
    │   └── InboxRow.tsx               # NEW: rich inbox row with media type label
    ├── store/slices/
    │   ├── chatSlice.ts               # EXTEND: VoiceRecording state, uploadStatus, unread
    │   └── searchSlice.ts             # NEW: SearchFilter state
    └── services/
        ├── signalr.ts                 # EXTEND: MarkRead, MessageDeleted handlers
        └── VoiceRecordingService.ts   # NEW: expo-av recording wrapper
```

**Structure Decision**: Mobile + API (existing project structure maintained).

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Voice recording library | expo-av | Already in project; supports pause/resume, metering API for waveform |
| Upload retry | 3× exponential back-off in thunk | No external library needed; drives `uploadStatus` Redux state |
| Search implementation | EF Core dynamic Where chaining | Sufficient for 10k catalog; avoids Elasticsearch operational cost |
| Admin moderation | Soft-delete + `ModerationAction` table | Preserves audit trail; reversible at DB level |
| Subcategory | New `SubCategory` table + FK on `Service` | Clean relational model; single migration |
| RTL support | `I18nManager.isRTL` + RTL snapshot tests | Matches existing project RTL approach |
| Inbox unread counts | `ChatReadReceipt` table | Real-time accurate counts via SignalR increment |

# Implementation Plan: Pre-sale Chat and Custom Offers

**Branch**: `001-pre-sale-chat-custom-offers` | **Date**: May 10, 2026 | **Spec**: /specs/001-pre-sale-chat-custom-offers/spec.md
**Input**: Feature specification from `/specs/001-pre-sale-chat-custom-offers/spec.md`

## Summary
Enable direct communication between students and executors before purchase and allow executors to send tailored "Custom Offers" with specific pricing and delivery terms. This involves extending the existing `Chat` and `Order` systems and adding a new `CustomOffer` entity.

## Technical Context

**Language/Version**: C# (ASP.NET Core 10.0), TypeScript (Expo SDK 54)
**Primary Dependencies**: EF Core 10, SignalR, Redux Toolkit
**Storage**: PostgreSQL
**Testing**: xUnit (Backend), Jest (Frontend)
**Target Platform**: Linux/Docker (Backend), iOS/Android (Mobile via Expo)
**Project Type**: mobile-app + web-service
**Performance Goals**: Real-time message/offer delivery (<1s latency)
**Constraints**: Offers must expire after 7 days; accepted offers must create valid orders.
**Scale/Scope**: ~10k users, university marketplace environment.

## Constitution Check

*GATE: Passed. Principles of separation of concerns and test-first development will be applied.*

## Project Structure

### Documentation (this feature)

```text
specs/001-pre-sale-chat-custom-offers/
├── plan.md              # This file
├── research.md          # Research findings and decisions
├── data-model.md        # Extended entities and relationships
├── quickstart.md        # Developer setup and verification steps
├── contracts/           
│   └── api.md           # API endpoints for offers
└── tasks.md             # Implementation tasks (generated next)
```

### Source Code

```text
msa3ed/
├── server/              # Backend
│   ├── Controllers/Api/ # ChatController, OrdersController updates
│   ├── Models/          # CustomOffer entity
│   ├── Services/        # Offer management logic
│   └── Hubs/            # SignalR broadcasting
└── UIS/                 # Frontend
    ├── app/             # Screens and navigation
    ├── components/      # UI components (OfferCard)
    └── store/slices/    # Redux slices (chatSlice)
```

**Structure Decision**: Hybrid structure utilizing the existing `msa3ed/server` for backend and `msa3ed/UIS` for frontend.

## Complexity Tracking

*No violations detected.*

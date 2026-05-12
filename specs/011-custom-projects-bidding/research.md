# Research: Custom Projects & Advanced Search

**Date**: 2026-05-12

## Advanced Search Filtering

### Current State
Search only supports `searchTerm` and `category` as basic query strings.

### Decision
1.  **Backend Filtering**: Expand `CatalogService` and `ExecutorsController` to accept `minPrice`, `maxPrice`, `minRating`, and `maxDeliveryDays`.
2.  **Frontend UI**: Use a Bottom Sheet (`@gorhom/bottom-sheet` or a custom animated view) in the `search.tsx` screen to host the filter controls without leaving the page.

## Project Bidding State Machine

### Decision
A `ProjectRequest` transitions from `Open` -> `Closed` (when an offer is accepted or the student manually closes it).
A `ProjectOffer` transitions from `Pending` -> `Accepted` -> `ConvertedToOrder` or `Pending` -> `Rejected` (if another offer is accepted).

### Rationale
Clear state separation prevents race conditions where a student might accidentally accept multiple offers.

## Pre-Acceptance Negotiation (Chat Integration)

### Current State
Private chats exist via `POST /api/Chat/Private/Initiate`.

### Decision
1.  **Offer Linking**: Add a `ProjectOfferId` (nullable) to the `Chat` or `Message` entity.
2.  **Workflow**: When a student views an offer, they can click "Negotiate/Chat". This initiates a standard private chat between the Student and Executor, but flags the context as related to `ProjectOfferId`. The executor can then use a specific endpoint `PUT /api/Projects/Offers/{id}` to update their proposed price/days during the chat.

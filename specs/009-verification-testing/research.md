# Research: Verification Scenarios and Endpoint Mapping

## Decision: Systematic Feature Verification
To fulfill the requirement of testing "all features" and "all endpoints", we will use a combination of automated API probes and manual UI walkthroughs.

## Endpoint Mapping (Phase 5 Refinement)

### Admin Features
| Endpoint | Method | Purpose | Verified In |
|----------|--------|---------|-------------|
| `/Admin/Wallets` | GET | View all user balances | Browser (MVC) |
| `/Admin/AdjustBalance` | POST | Manual credit/debit | Browser (MVC) |
| `/Admin/AuditLogs` | GET | View audit trail | Browser (MVC) |
| `/Admin/GeneralSettings`| GET/POST| Manage platform config| Browser (MVC) |

### Order & Wallet Features (API)
| Endpoint | Method | Purpose | Verified In |
|----------|--------|---------|-------------|
| `/api/Orders` | POST | Create order (Escrow hold) | Postman/Mobile UI |
| `/api/Orders/{id}/Accept`| POST | Executor accepts order | Postman/Mobile UI |
| `/api/Orders/{id}/Complete`|POST | Executor completes (Escrow release)| Postman/Mobile UI |
| `/api/Services` | GET | Search with multi-filters | Swagger/Mobile UI |
| `/api/Wallet` | GET | Get current user balance | Mobile UI |

## Core Workflow: The "Perfect Order" Cycle

1. **Setup**: Ensure Admin, Student, and Executor accounts exist. Student has > 100 EGP.
2. **Step 1 (Discovery)**: Student searches for "Test Service" using the new debounced search.
3. **Step 2 (Creation)**: Student creates an order for 100 EGP.
    - *Verification*: Student wallet -100. Escrow +100. Audit log: "Order Created".
4. **Step 3 (Acceptance)**: Executor accepts the order.
    - *Verification*: Order status: `InProgress`.
5. **Step 4 (Completion)**: Executor marks as complete.
    - *Verification*: Executor wallet +90. Platform Wallet +10 (Commission). Escrow -100.
6. **Step 5 (Audit)**: Admin checks `AuditLogs` to verify the "Escrow Released" entry.

## Execution Commands

### Backend
```bash
cd msa3ed/server
dotnet run
```

### Frontend
```bash
cd msa3ed/UIS
npm install
npx expo start
```

## Rationale
Manual verification via Swagger/UI is chosen over pure unit tests for this phase to ensure **UI-to-Backend integration** (e.g., debouncing, RTL alignment, Redux state updates) which unit tests often miss.

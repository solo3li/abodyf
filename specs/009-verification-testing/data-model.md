# Data Model: Verification Data Requirements

## Test Identities
| Role | Email | Initial State |
|------|-------|---------------|
| Admin | `admin@uis.edu` | `IsAdmin: true` |
| Student | `student@uis.edu` | `Balance: 1000.0` |
| Executor | `executor@uis.edu` | `IsExecutor: true`, `Balance: 0.0` |

## Test Scenarios
- **Scenario A (Search)**: At least 3 services with different categories and price points (e.g., 50, 150, 500 EGP).
- **Scenario B (Order)**: An active order in `Pending` state.
- **Scenario C (Escrow)**: An active escrow entry linked to an `InProgress` order.

## Validation Rules
- **Wallet Balance**: Cannot be negative after transaction (unless credit adjustment).
- **Commission**: Fixed at 10% (from `GeneralSettings`).
- **Audit Logs**: Must capture `Timestamp`, `ActorId`, `ActionType`, and `Metadata` (JSON).

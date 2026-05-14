# Research: uis-full-integration

## Decision: Manual Verification UI
**Finding**: The Admin Dashboard requires a streamlined way to verify manual payments.
**Rationale**: Since actual transfers happen outside the system, the UI must prioritize visual evidence (screenshots).
**Decision**: Use a Bootstrap Modal for screenshot previews with zoom capability. Add "Approve" and "Reject" buttons directly in the modal to minimize context switching.

## Decision: Real-Time Notifications
**Finding**: Users need immediate feedback when their financial status changes.
**Rationale**: Manual deposits can take time; providing a real-time SignalR alert when the admin approves/rejects improves the user experience.
**Decision**: Emit `UpdateWallet` event via `NotificationHub` when a `DepositRequest` or `WithdrawalRequest` changes status. The mobile app will listen for this event to refresh the wallet balance.

## Decision: Dispute Management Workflow
**Finding**: Disputes need a clear audit trail.
**Rationale**: Conflict resolution is high-risk.
**Decision**: Use the `IAuditLogService` to record every status change in a dispute, including the Admin's notes. The Admin view will show a chronological list of all disputes with filters for "Open", "UnderReview", and "Resolved".

## Decision: Mobile Wallet Integration
**Finding**: Students need a clear way to upload payment proof.
**Rationale**: Mobile users prefer easy photo uploads.
**Decision**: Use `expo-image-picker` to allow students to select a screenshot from their gallery. Upload to `/api/Wallet/Deposit` which returns a 201 Created and initiates the admin verification flow.

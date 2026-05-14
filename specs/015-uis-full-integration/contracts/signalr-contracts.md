# SignalR Contracts: uis-full-integration

## NotificationHub (Implicit)
New events emitted by the server to specific user groups.

### ReceiveNotification
- **Trigger**: Status change in Deposit, Withdrawal, or Dispute.
- **Client Method**: `ReceiveNotification`
- **Payload**:
  ```json
  {
    "Type": "WalletUpdate",
    "Message": "Your deposit of 500 EGP has been Approved.",
    "Data": {
      "Status": "Approved",
      "NewBalance": 1500.00
    }
  }
  ```

### ReceiveBalanceUpdate
- **Trigger**: Wallet balance changes (Deposit approved, Order paid).
- **Client Method**: `UpdateBalance`
- **Payload**:
  ```json
  {
    "UserId": "guid",
    "NewBalance": 1500.00
  }
  ```

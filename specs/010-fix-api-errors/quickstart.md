# Quickstart: fix-api-signalr-errors

This guide covers reproduction and verification of the API and SignalR fixes.

## Reproduction Steps

### 1. Inbox 500 Error
1. Log in as a user with existing private chats.
2. Send a `GET` request to `/api/Chat/Inbox`.
3. Observe the `500 Internal Server Error`.

### 2. Wallet 404 Error
1. Log in with a valid token.
2. Send a `GET` request to `/api/Wallet`.
3. Observe the `404 Not Found`.

### 3. SignalR Failure
1. Start the backend server.
2. Attempt to connect via a SignalR client using the public IP/Tunnel URL.
3. Observe the `net::ERR_FAILED` or `404` on the `/negotiate` endpoint.

## Verification Steps

### 1. Automated Tests
Run the backend tests:
```bash
cd msa3ed/server
dotnet test
```

### 2. Manual Verification (cURL)
Verify the Wallet endpoint:
```bash
curl -X GET "http://209.38.238.175:5035/api/Wallet" \
     -H "Authorization: Bearer <your_token>"
```

Verify the Inbox endpoint:
```bash
curl -X GET "http://209.38.238.175:5035/api/Chat/Inbox" \
     -H "Authorization: Bearer <your_token>"
```

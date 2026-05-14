# API Contracts: backend-full-verification

## Auth Endpoints
- `POST /api/Auth/login`: Returns `AuthResponseDto` (Token, UserInfo).
- `POST /api/Auth/register`: Returns `AuthResponseDto`. Verification is automatic.
- `POST /api/Auth/reset-password`: Accepts `ResetPasswordRequest`.

## User Endpoints
- `GET /api/Users/Me`: Returns current user details.
- `PUT /api/Users/Profile`: Updates user profile data.
- `POST /api/Users/ProfilePicture`: Uploads a multipart image file.

## Order Endpoints
- `POST /api/Orders`: Creates a new order and triggers Escrow hold.
- `POST /api/Orders/{id}/Accept`: Marks order as InProgress.
- `POST /api/Orders/{id}/Complete`: Marks order as Completed and triggers Escrow release.

## Wallet Endpoints
- `GET /api/Wallet`: Returns current balance and recent transactions.
- `POST /api/Wallet/TopUp`: Increases wallet balance (simulated payment).

## Error Response Format
All errors return a 400/404/500 status code with a JSON body:
```json
{
  "message": "Human readable error message",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

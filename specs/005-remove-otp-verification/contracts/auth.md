# API Contract: Authentication (Updated)

## POST /api/Auth/login

### Response (Success 200)
```json
{
  "token": "JWT_TOKEN_STRING",
  "user": {
    "id": "GUID",
    "name": "Full Name",
    "email": "user@example.com",
    "isExecutor": false,
    "roles": ["Student"]
  }
}
```

## POST /api/Auth/register

### Response (Success 200)
```json
{
  "token": "JWT_TOKEN_STRING",
  "user": {
    "id": "GUID",
    "name": "Full Name",
    "email": "user@example.com",
    "isExecutor": false,
    "roles": ["Student"]
  }
}
```

## POST /api/Auth/verify-otp (Backward Compatibility)

### Response (Success 200)
```json
{
  "message": "Verification Not Required",
  "id": "GUID",
  "name": "Full Name",
  "email": "user@example.com",
  "isExecutor": false,
  "roles": ["Student"]
}
```

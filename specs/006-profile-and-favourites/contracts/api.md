# API Contract: User Profile & Favourites

## 1. Favourites Endpoints

### GET /api/Favorites
- **Description**: Returns all services bookmarked by the current user.
- **Response (200)**: `ServiceDto[]` (Same as standard service list)

### POST /api/Favorites/{serviceId}
- **Description**: Toggles favourite status (Add if doesn't exist, remove if it does).
- **Response (200)**: `{ "isFavorite": true/false }`

## 2. Profile Endpoints

### PUT /api/Users/Profile
- **Description**: Updates textual profile information.
- **Request Body**:
```json
{
  "fullName": "New Name",
  "university": "New Uni",
  "major": "New Major",
  "bio": "New Bio"
}
```
- **Response (200)**: `UserDto` (Updated user)

### POST /api/Users/ProfilePicture
- **Description**: Uploads and updates the user's profile picture.
- **Request**: `multipart/form-data` (field: `file`)
- **Response (200)**: `{ "imageUrl": "URL_TO_IMAGE" }`

### DELETE /api/Users/ProfilePicture
- **Description**: Removes the custom profile picture and reverts to default.
- **Response (204)**: No Content

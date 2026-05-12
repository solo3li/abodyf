# Quickstart: Advanced Chat System Development

## Prerequisites
- **FFmpeg**: Must be installed on the host/server.
    - Linux: `sudo apt install ffmpeg`
    - macOS: `brew install ffmpeg`
    - Windows: `choco install ffmpeg`
- **Expo SDK 54**: Ensure local `npx expo` is up to date.

## Backend Setup (Server)
1. Install `FFMpegCore` NuGet package:
   ```bash
   dotnet add package FFMpegCore
   ```
2. Apply database migrations:
   ```bash
   dotnet ef migrations add AddAdvancedChatFeatures
   dotnet ef database update
   ```
3. Run the server:
   ```bash
   dotnet run
   ```

## Frontend Setup (UIS)
1. Install new dependencies:
   ```bash
   npm install expo-av react-native-reanimated react-native-svg
   ```
2. Ensure `babel.config.js` has the Reanimated plugin:
   ```javascript
   plugins: ['react-native-reanimated/plugin'],
   ```
3. Start Expo:
   ```bash
   npx expo start -c
   ```

## Verification Steps
1. **Private Chat**: Go to an executor's profile and click "Contact". Verify a new chat is created in the "Inbox" tab.
2. **Audio Waveform**: Record a voice message. Verify the server returns a `WaveformData` array in the response.
3. **Custom Offer**: As an executor, send an offer. As a student, verify the "Accept" button triggers the payment flow.

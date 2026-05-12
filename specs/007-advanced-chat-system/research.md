# Research: Advanced Chat System

## Audio Waveform Generation (.NET)
- **Decision**: Use `FFMpegCore` (wrapper for FFmpeg) to extract peak data from uploaded audio files.
- **Rationale**: FFmpeg is the industry standard for cross-platform audio processing. It can reliably extract sample peaks from MP4/AAC and WebM formats which are common in mobile environments.
- **Alternatives considered**: 
    - `NAudio`: Rejected because it has limited support for modern formats like AAC/WebM without external decoders and is primarily Windows-focused.
    - `Client-side generation`: Rejected to ensure SC-003 (low sync latency) and to allow instant rendering without downloading the full file first.

## Waveform Visualization (React Native)
- **Decision**: 
    - **Real-time**: Use `react-native-reanimated` to map microphone input levels (from `expo-av`) to a set of animated bars.
    - **Static**: Render a simplified SVG or a row of `View` components based on the peak array provided by the server.
- **Rationale**: Provides smooth 60fps performance (SC-004) while remaining lightweight.
- **Alternatives considered**: 
    - `react-native-audio-waveform`: Rejected as it's often abandoned or not compatible with Expo's managed workflow.

## Private Inbox Hub Logic
- **Decision**: Utilize the existing `PrivateChatHub`. Ensure that `JoinChat` validates that the user is a participant in the requested `ChatId`.
- **Rationale**: Keeps order-related traffic separate from negotiation traffic, allowing for granular scaling and simplified access control.
- **Alternatives considered**: 
    - `Single ChatHub`: Rejected to avoid complex conditional logic within the hub methods for different chat types.

## Custom Offer Checkout Flow
- **Decision**: Add a `CreateOrderFromOffer` method to the `OrderService`. The Student's "Accept" action calls an API endpoint that validates the offer status and redirects to the existing payment flow.
- **Rationale**: Reuses existing order and escrow logic while providing the "Fiverr-like" tailored experience.
- **Alternatives considered**: 
    - `Direct Payment`: Rejected because it bypasses the platform's order management and escrow protections.

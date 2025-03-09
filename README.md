# Distance Buddy - ESP32 Distance Monitor

A playful React Native Expo app that connects to an ESP32 WebSocket server to display distance measurements with elegant animations, vibration feedback, and fun messaging.

## Features

- Real-time distance monitoring via WebSocket connection
- Beautiful UI with smooth animations and transitions
- Square to circle shape transitions with vibration feedback
- Fun, playful messages that change based on measured distance
- Vibration effects when new measurements arrive
- Configurable settings for WebSocket URL and proximity threshold

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure your ESP32 WebSocket server address in `config.ts`:
   ```typescript
   export const CONFIG = {
     WS_URL: 'ws://your-esp32-ip-address:port',
     // other settings...
   };
   ```
4. Start the Expo development server:
   ```
   npm start
   ```

## ESP32 WebSocket Server

This app expects the ESP32 server to send distance measurements in the following JSON format:

```json
{
  "distance": 15.5
}
```

When the distance is less than the configured threshold (default: 10cm), the app will display an alert with animations and vibration feedback.

## Configuration

You can customize the app behavior by editing the `config.ts` file:

- `WS_URL`: WebSocket server URL
- `PROXIMITY_THRESHOLD`: Distance threshold for proximity detection (in cm)
- `ANIMATION`: Animation settings (scale, duration, opacity)
- `COLORS`: Color schemes for normal and alert states

## Technologies Used

- React Native
- Expo
- React Native Reanimated for animations
- Lottie for complex animations
- NativeWind (TailwindCSS for React Native)
- WebSockets for real-time communication
- Vibration API for haptic feedback

## License

MIT

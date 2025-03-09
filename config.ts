// Configuration for the ESP32 WebSocket server
export const CONFIG = {
  // Replace with your ESP32 server IP address and port
  WS_URL: 'ws://192.168.1.70/ws',
  
  // Threshold in centimeters for proximity detection
  PROXIMITY_THRESHOLD: 10,
  
  // Animation settings
  ANIMATION: {
    SCALE_FACTOR: 1.15,
    DURATION: 600,
    OPACITY: 0.95,
  },
  
  // Colors
  COLORS: {
    NORMAL: {
      PRIMARY: 'rgba(255, 255, 255, 0.6)',  // Translucent white
      TEXT: '#334155',                       // Slate-700
      BORDER: 'rgba(226, 232, 240, 0.8)'     // Slate-200 with transparency
    },
    ALERT: {
      PRIMARY: 'rgba(248, 250, 252, 0.7)',   // Translucent slate-50
      TEXT: '#334155',                       // Slate-700
      BORDER: 'rgba(203, 213, 225, 0.8)'     // Slate-300 with transparency
    },
    RIPPLE: {
      FIRST: 'rgba(255, 255, 255, 0.7)',     // Most transparent
      SECOND: 'rgba(255, 255, 255, 0.8)',    // Medium transparency
      THIRD: 'rgba(255, 255, 255, 0.9)'      // Least transparent
    }
  },
};

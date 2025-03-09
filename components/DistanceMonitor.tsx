import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { CONFIG } from '../config';

// Fun messages for different distance ranges with corresponding colors
const getDistanceInfo = (distance: number | null) => {
  if (distance === null) {
    return {
      message: "Waiting for something to measure...",
      color: '#64748b', // Slate-500
      detailMessage: "I'm waiting for something to get closer..."
    };
  }
  
  if (distance < 5) {
    return {
      message: "Whoa! Too close for comfort! 😱",
      color: '#10b981', // Emerald-500 (greenish)
      detailMessage: "Whoa! That's super close! Back up a bit!"
    };
  }
  
  if (distance < 10) {
    return {
      message: "Hey there, personal space invader! 👋",
      color: '#34d399', // Emerald-400 (lighter green)
      detailMessage: "You're getting pretty close now!"
    };
  }
  
  if (distance < 20) {
    return {
      message: "Getting closer... I can feel it! 🤗",
      color: '#3b82f6', // Blue-500
      detailMessage: "Keep coming closer if you'd like!"
    };
  }
  
  if (distance < 50) {
    return {
      message: "I see you over there! Come closer! 👀",
      color: '#6366f1', // Indigo-500
      detailMessage: "You're at a good distance, but you can come closer!"
    };
  }
  
  return {
    message: "Where did everybody go? I'm lonely... 🥺",
    color: '#8b5cf6', // Violet-500
    detailMessage: "I can't detect anything nearby. Move something closer!"
  };
};

interface DistanceMonitorProps {
  wsUrl?: string;
}

export const DistanceMonitor: React.FC<DistanceMonitorProps> = ({ 
  wsUrl = CONFIG.WS_URL 
}) => {
  const [distance, setDistance] = useState<number | null>(null);
  const [isNearby, setIsNearby] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const wsRef = useRef<WebSocket | null>(null);
  const currentUrlRef = useRef<string>(wsUrl);
  
  // Animated values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const bgColorProgress = useSharedValue(0);
  
  // Function to connect to WebSocket
  const connectWebSocket = () => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    try {
      setConnectionStatus('Connecting...');
      const ws = new WebSocket(currentUrlRef.current);
      
      ws.onopen = () => {
        setConnectionStatus('Connected');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && typeof data.distance === 'number') {
            setDistance(data.distance);
            
            // Check if distance is less than threshold
            const isClose = data.distance < CONFIG.PROXIMITY_THRESHOLD;
            if (isClose !== isNearby) {
              setIsNearby(isClose);
              
              // Trigger animations when state changes
              if (isClose) {
                scale.value = withSpring(CONFIG.ANIMATION.SCALE_FACTOR, { damping: 10, stiffness: 100 });
                opacity.value = withTiming(CONFIG.ANIMATION.OPACITY, { duration: 300 });
                bgColorProgress.value = withTiming(1, { duration: CONFIG.ANIMATION.DURATION });
              } else {
                scale.value = withSpring(1, { damping: 10, stiffness: 100 });
                opacity.value = withTiming(1, { duration: 300 });
                bgColorProgress.value = withTiming(0, { duration: CONFIG.ANIMATION.DURATION });
              }
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Connection error');
      };
      
      ws.onclose = () => {
        setConnectionStatus('Disconnected');
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('Connection error');
      // Try to reconnect after a delay
      setTimeout(connectWebSocket, 3000);
    }
  };
  
  // Connect to WebSocket on component mount
  useEffect(() => {
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  // Reconnect when URL changes
  useEffect(() => {
    if (wsUrl !== currentUrlRef.current) {
      currentUrlRef.current = wsUrl;
      connectWebSocket();
    }
  }, [wsUrl]);
  
  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    // Use greenish colors when distance is less than 10cm
    const isCloseDistance = distance !== null && distance < 10;
    
    return {
      transform: [
        { scale: scale.value }
      ],
      opacity: opacity.value,
      backgroundColor: isCloseDistance 
        ? 'rgba(240, 253, 244, 0.9)' // Green-50 with transparency
        : interpolateColor(
            bgColorProgress.value,
            [0, 1],
            [CONFIG.COLORS.NORMAL.PRIMARY, CONFIG.COLORS.ALERT.PRIMARY]
          ),
      borderColor: isCloseDistance
        ? 'rgba(167, 243, 208, 0.8)' // Green-200 with transparency
        : interpolateColor(
            bgColorProgress.value,
            [0, 1],
            [CONFIG.COLORS.NORMAL.BORDER, CONFIG.COLORS.ALERT.BORDER]
          ),
    };
  });
  
  const animatedTextStyle = useAnimatedStyle(() => {
    // Use green text when distance is less than 10cm
    const isCloseDistance = distance !== null && distance < 10;
    
    return {
      transform: [{ scale: scale.value * 0.9 }],
      color: isCloseDistance
        ? '#059669' // Emerald-600
        : interpolateColor(
            bgColorProgress.value,
            [0, 1],
            [CONFIG.COLORS.NORMAL.TEXT, CONFIG.COLORS.ALERT.TEXT]
          ),
    };
  });
  
  // Get distance info based on current distance
  const distanceInfo = getDistanceInfo(distance);
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.statusText}>
          {connectionStatus === 'Connected' ? 'Ready to measure!' : connectionStatus}
        </Text>
        
        <View style={styles.monitorContainer}>
          <Animated.View 
            style={[styles.distanceDisplay, animatedContainerStyle]} 
          >
            <Animated.Text style={[styles.distanceText, animatedTextStyle]}>
              {distance !== null ? `${distance.toFixed(1)}` : '--'}
            </Animated.Text>
            {distance !== null && <Text style={styles.unitText}>cm</Text>}
          </Animated.View>
        </View>
        
        <Text style={[styles.funMessage, { color: distanceInfo.color }]}>
          {distanceInfo.message}
        </Text>
        
        <Text style={styles.helpText}>
          {distanceInfo.detailMessage}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    marginBottom: 40,
    color: '#64748b',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  monitorContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 250,
    height: 250,
  },
  distanceDisplay: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 125, // Always a circle
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 0.2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  distanceText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 4,
  },
  funMessage: {
    fontSize: 18,
    marginTop: 32,
    textAlign: 'center',
    paddingHorizontal: 24,
    fontWeight: '500',
  },
  helpText: {
    fontSize: 14,
    marginTop: 16,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

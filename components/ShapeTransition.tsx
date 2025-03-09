import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

interface ShapeTransitionProps {
  isCircle: boolean;
  onToggle: () => void;
  size?: number;
  color?: string;
  duration?: number;
}

export const ShapeTransition = ({
  isCircle,
  onToggle,
  size = 200,
  color = '#3b82f6',
  duration = 800,
}: ShapeTransitionProps) => {
  // Animation value for border radius (0 = square, 1 = circle)
  const borderRadiusValue = useSharedValue(isCircle ? 1 : 0);
  
  // Update animation when isCircle changes
  useEffect(() => {
    borderRadiusValue.value = withTiming(
      isCircle ? 1 : 0,
      {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }
    );
  }, [isCircle, duration]);
  
  // Animated style for the shape
  const animatedStyle = useAnimatedStyle(() => {
    // Calculate border radius (0% for square, 50% for circle)
    const borderRadius = `${borderRadiusValue.value * 50}%`;
    
    return {
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius,
      justifyContent: 'center',
      alignItems: 'center',
    };
  });
  
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
      <Animated.View style={animatedStyle}>
        <Text style={styles.text}>
          {isCircle ? 'Circle' : 'Square'}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

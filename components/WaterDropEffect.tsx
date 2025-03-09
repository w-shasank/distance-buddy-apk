import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  withDelay,
} from 'react-native-reanimated';

interface WaterDropEffectProps {
  active: boolean;
}

export const WaterDropEffect = ({ active }: WaterDropEffectProps) => {
  const dropOpacity = useSharedValue(0);
  const dropScale = useSharedValue(0);
  const dropTranslateY = useSharedValue(0);
  
  useEffect(() => {
    if (active) {
      // Start animation sequence
      dropOpacity.value = 1;
      dropScale.value = 0;
      dropTranslateY.value = -50;
      
      // Animate the water drop falling and splashing
      dropScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      dropTranslateY.value = withSequence(
        withTiming(0, { duration: 500, easing: Easing.bounce }),
        withDelay(
          100,
          withSequence(
            withTiming(-10, { duration: 200, easing: Easing.out(Easing.cubic) }),
            withTiming(0, { duration: 200, easing: Easing.bounce })
          )
        )
      );
      
      // Repeat the animation
      const interval = setInterval(() => {
        if (active) {
          dropOpacity.value = 1;
          dropScale.value = 0;
          dropTranslateY.value = -50;
          
          dropScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
          dropTranslateY.value = withSequence(
            withTiming(0, { duration: 500, easing: Easing.bounce }),
            withDelay(
              100,
              withSequence(
                withTiming(-10, { duration: 200, easing: Easing.out(Easing.cubic) }),
                withTiming(0, { duration: 200, easing: Easing.bounce })
              )
            )
          );
        }
      }, 2000);
      
      return () => clearInterval(interval);
    } else {
      // Fade out animation when not active
      dropOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [active]);
  
  const dropStyle = useAnimatedStyle(() => {
    return {
      opacity: dropOpacity.value,
      transform: [
        { scale: dropScale.value },
        { translateY: dropTranslateY.value },
      ],
    };
  });
  
  const splashStyle = useAnimatedStyle(() => {
    return {
      opacity: dropOpacity.value * (dropTranslateY.value === 0 ? 1 : 0),
      transform: [
        { scale: dropTranslateY.value === 0 ? withTiming(1.5, { duration: 300 }) : 0 },
      ],
    };
  });
  
  if (!active) return null;
  
  return (
    <View className="absolute w-full h-full items-center justify-center pointer-events-none">
      <Animated.View 
        style={[dropStyle]} 
        className="absolute w-6 h-6 bg-blue-500 rounded-full"
      />
      
      <Animated.View 
        style={[splashStyle]} 
        className="absolute bottom-0 w-12 h-3 bg-blue-400 rounded-full opacity-70"
      />
    </View>
  );
};

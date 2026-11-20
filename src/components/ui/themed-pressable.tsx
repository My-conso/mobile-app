import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
   ReduceMotion,
   useAnimatedStyle,
   useSharedValue,
   withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ThemedPressableProps extends PressableProps {
   className?: string;
   /** Scale while pressed (default 0.97; 0.9 for small icons). 1 = no press effect. */
   pressScale?: number;
}

/**
 * Themed Pressable: button role by default and a press effect (scale down in 120 ms, on the UI thread).
 * Use `min-h-11` / `min-w-11` (44 px) in `className` for small tap targets.
 */
export const ThemedPressable: React.FC<ThemedPressableProps> = ({
   className,
   accessibilityRole = 'button',
   pressScale = 0.97,
   onPressIn,
   onPressOut,
   style,
   ...props
}) => {
   const scale = useSharedValue(1);
   const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
   return (
      <AnimatedPressable
         accessibilityRole={accessibilityRole}
         className={className}
         style={[animated, style as never]}
         onPressIn={e => {
            scale.value = withTiming(pressScale, {
               duration: 120,
               reduceMotion: ReduceMotion.System,
            });
            onPressIn?.(e);
         }}
         onPressOut={e => {
            scale.value = withTiming(1, { duration: 120, reduceMotion: ReduceMotion.System });
            onPressOut?.(e);
         }}
         {...props}
      />
   );
};

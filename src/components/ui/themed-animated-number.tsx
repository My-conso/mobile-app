import React, { useEffect } from 'react';
import Animated, {
   Easing,
   ReduceMotion,
   useAnimatedStyle,
   useSharedValue,
   withDelay,
   withTiming,
} from 'react-native-reanimated';
import { ThemedText, type ThemedTextProps } from './themed-text';
import { formatNumber } from '@/src/lib/format';

interface AnimatedNumberProps extends Omit<ThemedTextProps, 'children' | 'numeric'> {
   value: number;
   decimals?: number;
   /** Kept for compatibility, no longer used (the figure no longer counts up) */
   from?: number;
   /** Duration in ms (default 420) */
   duration?: number;
   /** Slightly stronger pop (main figure of the home screen) */
   bounce?: boolean;
}

/**
 * Figure that pops in when it appears (opacity + scale, UI thread).
 * It used to count up by rewriting a TextInput on every frame: that forces a native text layout per
 * frame, which was the main source of jank on low-end phones. A transform costs nothing.
 */
export function AnimatedNumber({
   value,
   decimals = 0,
   duration = 420,
   bounce = false,
   ...rest
}: AnimatedNumberProps) {
   const p = useSharedValue(0);

   useEffect(() => {
      p.value = 0;
      p.value = withDelay(
         220,
         withTiming(1, {
            duration,
            easing: bounce ? Easing.out(Easing.back(1.6)) : Easing.out(Easing.cubic),
            reduceMotion: ReduceMotion.System,
         })
      );
   }, [value, duration, bounce, p]);

   const style = useAnimatedStyle(() => ({
      opacity: Math.min(p.value * 2, 1),
      transform: [{ scale: 0.88 + 0.12 * p.value }],
   }));

   return (
      <Animated.View style={[{ alignSelf: 'flex-start', transformOrigin: 'left center' }, style]}>
         <ThemedText numeric {...rest}>
            {formatNumber(value, decimals)}
         </ThemedText>
      </Animated.View>
   );
}

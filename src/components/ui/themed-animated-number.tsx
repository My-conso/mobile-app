import React, { useEffect } from 'react';
import { TextInput } from 'react-native';
import Animated, {
   Easing,
   ReduceMotion,
   useAnimatedProps,
   useSharedValue,
   withDelay,
   withTiming,
} from 'react-native-reanimated';
import { textClassName, type ThemedTextProps } from './themed-text';
import { cn } from '@/src/utils/tailwind';
import { formatNumber } from '@/src/lib/format';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedNumberProps extends Omit<ThemedTextProps, 'children' | 'numeric'> {
   value: number;
   decimals?: number;
   /** Start value (default 0) */
   from?: number;
   /** Duration in ms (default 1000) */
   duration?: number;
   /** Small overshoot at the end (main figure of the home screen) */
   bounce?: boolean;
}

// Same output as formatNumber (French: space for thousands, comma for decimals), written as a worklet
// so the number can change on the UI thread: no React re-render per frame, smooth on low-end phones.
function format(value: number, decimals: number): string {
   'worklet';
   const fixed = Math.abs(value).toFixed(decimals);
   const parts = fixed.split('.');
   const grouped = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
   return (
      (value < 0 && Number(fixed) !== 0 ? '-' : '') + grouped + (parts[1] ? ',' + parts[1] : '')
   );
}

/** Figure that rolls to its value when it appears. Runs entirely on the UI thread (Reanimated). */
export function AnimatedNumber({
   value,
   decimals = 0,
   from = 0,
   duration = 1000,
   bounce = false,
   className,
   variant,
   weight,
   color,
   ...rest
}: AnimatedNumberProps) {
   const shown = useSharedValue(from);

   useEffect(() => {
      shown.value = withDelay(
         260,
         withTiming(value, {
            duration,
            easing: bounce ? Easing.out(Easing.back(1.4)) : Easing.out(Easing.cubic),
            reduceMotion: ReduceMotion.System,
         })
      );
   }, [value, duration, bounce, shown]);

   const animatedProps = useAnimatedProps(
      () =>
         ({
            text: format(shown.value, decimals),
            defaultValue: format(shown.value, decimals),
         }) as never
   );

   return (
      <AnimatedTextInput
         editable={false}
         pointerEvents="none"
         underlineColorAndroid="transparent"
         accessibilityRole="text"
         accessibilityLabel={formatNumber(value, decimals)}
         defaultValue={formatNumber(value, decimals)}
         animatedProps={animatedProps}
         className={cn(textClassName({ variant, weight, color, numeric: true, className }), 'p-0')}
         {...(rest as object)}
      />
   );
}

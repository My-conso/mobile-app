import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
   Easing,
   ReduceMotion,
   cancelAnimation,
   runOnJS,
   useAnimatedStyle,
   useSharedValue,
   withTiming,
} from 'react-native-reanimated';
import { Row, ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { ThemedIcon, type IconName } from './themed-icon';
import { ThemedPressable } from './themed-pressable';
import { haptic } from '@/src/lib/haptics';

interface HoldRowProps {
   label: string;
   hint: string;
   icon: IconName;
   /** How long the row must be held (default 1.2 s) */
   duration?: number;
   onComplete: () => void;
}

/**
 * Dangerous action that needs a deliberate press: a translucent red fill sweeps from left to right while the row is
 * held; letting go early empties it at once. Completing fires a vibration, then `onComplete`.
 */
export function HoldRow({ label, hint, icon, duration = 1200, onComplete }: HoldRowProps) {
   const fill = useSharedValue(0);
   const fillStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: (fill.value - 1) * 400 }],
   }));

   const done = () => {
      haptic.medium();
      onComplete();
   };

   return (
      <ThemedPressable
         accessibilityLabel={`${label}. ${hint}`}
         pressScale={1}
         onPressIn={() => {
            fill.value = withTiming(
               1,
               { duration, easing: Easing.linear, reduceMotion: ReduceMotion.Never },
               finished => {
                  if (finished) {
                     fill.value = 0;
                     runOnJS(done)();
                  }
               }
            );
         }}
         onPressOut={() => {
            cancelAnimation(fill);
            fill.value = 0;
         }}
         className="min-h-13 overflow-hidden">
         <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, fillStyle]}>
            <ThemedView className="bg-danger/25 flex-1" />
         </Animated.View>
         <Row items="center" gap="md" bg="transparent" className="min-h-13 px-4">
            <ThemedIcon name={icon} color="danger" />
            <ThemedText variant="body" color="danger" className="flex-1" numberOfLines={1}>
               {label}
            </ThemedText>
            <ThemedText variant="caption" color="secondary">
               {hint}
            </ThemedText>
         </Row>
      </ThemedPressable>
   );
}

import React, { useEffect } from 'react';
import Animated, {
   ReduceMotion,
   useAnimatedStyle,
   useSharedValue,
   withTiming,
} from 'react-native-reanimated';
import { ThemedPressable } from './themed-pressable';
import { ThemedView } from './themed-view';
import { cn } from '@/src/utils/tailwind';
import { haptic } from '@/src/lib/haptics';

interface ThemedSwitchProps {
   value: boolean;
   onValueChange: (v: boolean) => void;
   accessibilityLabel: string;
}

const TRAVEL = 20;

/** Pill switch (52 x 32): the knob glides in 180 ms, instantly when "reduce motion" is on. */
export function ThemedSwitch({ value, onValueChange, accessibilityLabel }: ThemedSwitchProps) {
   const x = useSharedValue(value ? TRAVEL : 0);

   useEffect(() => {
      x.value = withTiming(value ? TRAVEL : 0, {
         duration: 180,
         reduceMotion: ReduceMotion.System,
      });
   }, [value, x]);

   const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

   return (
      <ThemedPressable
         accessibilityRole="switch"
         accessibilityState={{ checked: value }}
         accessibilityLabel={accessibilityLabel}
         onPress={() => {
            haptic.selection();
            onValueChange(!value);
         }}
         hitSlop={8}
         className="active:opacity-100">
         <ThemedView
            bg="transparent"
            className={cn(
               'h-8 w-13 justify-center rounded-full p-[3px]',
               value ? 'bg-primary' : 'bg-border'
            )}>
            <Animated.View style={knobStyle}>
               <ThemedView
                  className={cn(
                     'size-[26px] rounded-full',
                     value ? 'bg-foreground-inverse' : 'bg-foreground-muted'
                  )}
               />
            </Animated.View>
         </ThemedView>
      </ThemedPressable>
   );
}

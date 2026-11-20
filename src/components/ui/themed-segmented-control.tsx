import React, { useEffect, useState } from 'react';
import Animated, {
   Easing,
   ReduceMotion,
   useAnimatedStyle,
   useSharedValue,
   withTiming,
} from 'react-native-reanimated';
import { Row, ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { ThemedPressable } from './themed-pressable';
import { haptic } from '@/src/lib/haptics';

interface Option<T extends string> {
   value: T;
   label: string;
}

const PAD = 4;

/** Pill selector. The active pill slides under the options (260 ms, transform only). */
export function SegmentedControl<T extends string>({
   options,
   value,
   onChange,
}: {
   options: Option<T>[];
   value: T;
   onChange: (v: T) => void;
}) {
   const [width, setWidth] = useState(0);
   const index = Math.max(
      0,
      options.findIndex(o => o.value === value)
   );
   const slot = width > 0 ? (width - PAD * 2) / options.length : 0;
   const x = useSharedValue(index * slot);

   useEffect(() => {
      x.value = withTiming(index * slot, {
         duration: 260,
         easing: Easing.out(Easing.cubic),
         reduceMotion: ReduceMotion.System,
      });
   }, [index, slot, x]);

   const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

   return (
      <Row
         rounded="full"
         padding="xs"
         bg="card"
         onLayout={e => setWidth(e.nativeEvent.layout.width)}
         accessibilityRole="radiogroup">
         {slot > 0 ? (
            <Animated.View
               pointerEvents="none"
               style={[
                  { position: 'absolute', top: PAD, bottom: PAD, left: PAD, width: slot },
                  pill,
               ]}>
               <ThemedView className="bg-primary flex-1 rounded-full" />
            </Animated.View>
         ) : null}
         {options.map(o => {
            const active = o.value === value;
            return (
               <ThemedPressable
                  key={o.value}
                  onPress={() => {
                     if (!active) haptic.selection();
                     onChange(o.value);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active, checked: active }}
                  className="min-h-11 flex-1 items-center justify-center rounded-full px-1">
                  {/* One line only: shrink the text instead of wrapping on narrow screens */}
                  <ThemedText
                     variant="body-small"
                     weight={active ? 'semibold' : 'normal'}
                     color={active ? 'inverse' : 'secondary'}
                     numberOfLines={1}
                     adjustsFontSizeToFit
                     minimumFontScale={0.75}>
                     {o.label}
                  </ThemedText>
               </ThemedPressable>
            );
         })}
      </Row>
   );
}

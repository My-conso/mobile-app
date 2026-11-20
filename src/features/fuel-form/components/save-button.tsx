import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
   Easing,
   ReduceMotion,
   interpolate,
   useAnimatedStyle,
   useSharedValue,
   withTiming,
} from 'react-native-reanimated';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedIcon } from '@/src/components/ui/themed-icon';
import { ThemedPressable } from '@/src/components/ui/themed-pressable';

const SIZE = 56;

interface SaveButtonProps {
   title: string;
   onPress: () => void;
   /** true: the button shrinks into a circle and shows a check */
   saving: boolean;
}

/**
 * Main action of a form. While saving it shrinks into a 56 px circle (260 ms), the label fades out and a check
 * fades in. Width is animated here on purpose: it is the one place where the design asks for it.
 */
export function SaveButton({ title, onPress, saving }: SaveButtonProps) {
   const [fullWidth, setFullWidth] = useState(0);
   const progress = useSharedValue(0);

   useEffect(() => {
      progress.value = withTiming(saving ? 1 : 0, {
         duration: 260,
         easing: Easing.out(Easing.cubic),
         reduceMotion: ReduceMotion.System,
      });
   }, [saving, progress]);

   const box = useAnimatedStyle(() => ({
      width: fullWidth ? interpolate(progress.value, [0, 1], [fullWidth, SIZE]) : '100%',
      borderRadius: interpolate(progress.value, [0, 1], [18, SIZE / 2]),
   }));
   const label = useAnimatedStyle(() => ({
      opacity: interpolate(progress.value, [0, 0.45], [1, 0], 'clamp'),
   }));
   const check = useAnimatedStyle(() => ({
      opacity: interpolate(progress.value, [0.5, 1], [0, 1], 'clamp'),
   }));

   return (
      <View onLayout={e => setFullWidth(e.nativeEvent.layout.width)} className="items-center">
         <ThemedPressable
            accessibilityLabel={title}
            disabled={saving}
            onPress={onPress}
            className="w-full items-center">
            <Animated.View
               style={[{ height: SIZE }, box]}
               className="bg-primary items-center justify-center overflow-hidden">
               <Animated.View style={label}>
                  <ThemedText variant="button" color="inverse" numberOfLines={1}>
                     {title}
                  </ThemedText>
               </Animated.View>
               <Animated.View style={[{ position: 'absolute' }, check]}>
                  <ThemedIcon name="check" customSize={26} color="inverse" strokeWidth={2.8} />
               </Animated.View>
            </Animated.View>
         </ThemedPressable>
      </View>
   );
}

import {
   ReduceMotion,
   useAnimatedStyle,
   useSharedValue,
   withSequence,
   withTiming,
} from 'react-native-reanimated';
import { haptic } from '@/src/lib/haptics';

/** Horizontal shake for a field that is required but empty (420 ms, transform only) with an error vibration. */
export function useShake() {
   const x = useSharedValue(0);
   const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
   const shake = () => {
      haptic.error();
      const o = { duration: 84, reduceMotion: ReduceMotion.System };
      x.value = withSequence(
         withTiming(-7, o),
         withTiming(6, o),
         withTiming(-4, o),
         withTiming(3, o),
         withTiming(0, o)
      );
   };
   return { style, shake };
}

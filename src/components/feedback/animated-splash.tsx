import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
   Easing,
   ReduceMotion,
   runOnJS,
   useAnimatedStyle,
   useSharedValue,
   withDelay,
   withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { ThemedText } from '../ui/themed-text';
import { useThemeColor } from '@/src/hooks/use-theme-color';

/** Total length of the animation before the app is revealed. Never longer than ~1.2 s. */
const TOTAL = 1100;

function Scooter() {
   const accent = useThemeColor('--color-primary', 'primary');
   const deep = useThemeColor('--color-background-top', 'backgroundTop');
   const dark = useThemeColor('--color-foreground-faint', 'foregroundFaint');
   const engine = useThemeColor('--color-foreground-secondary', 'foregroundSecondary');
   const body = useThemeColor('--color-foreground', 'foreground');
   const light = useThemeColor('--color-danger', 'danger');
   return (
      <Svg width={300} height={230} viewBox="85 15 510 360">
         <Circle cx={230} cy={300} r={65} fill={accent} />
         <Circle cx={230} cy={300} r={34} fill={deep} />
         <Circle cx={230} cy={300} r={10} fill={accent} />
         <Circle cx={520} cy={300} r={65} fill={accent} />
         <Circle cx={520} cy={300} r={34} fill={deep} />
         <Line
            x1={512}
            y1={215}
            x2={520}
            y2={300}
            stroke={dark}
            strokeWidth={14}
            strokeLinecap="round"
         />
         <Circle cx={520} cy={300} r={10} fill={accent} />
         <Path d="M282 255 L350 255 L338 292 C330 300 300 302 290 292 Z" fill={engine} />
         <Path
            d="M100 205 C112 172 175 172 200 176 L345 184 C362 200 364 240 348 262 L302 262 C292 232 262 216 230 216 C196 216 166 236 158 262 L140 262 C114 250 96 228 100 205 Z"
            fill={body}
         />
         <Path
            d="M150 182 C160 156 205 154 245 157 L333 164 C350 167 354 180 345 190 L158 188 Z"
            fill={dark}
         />
         <Rect x={320} y={248} width={135} height={22} rx={11} fill={dark} />
         <Path
            d="M408 270 L452 132 C460 106 480 92 506 92 L534 95 C556 99 563 118 555 140 L532 208 C514 226 490 240 478 256 L468 270 Z"
            fill={body}
         />
         <Path
            d="M466 266 C484 230 556 226 580 258 L570 266 C548 242 494 244 478 270 Z"
            fill={body}
         />
         <Path
            d="M506 94 L498 62 L452 52"
            fill="none"
            stroke={dark}
            strokeWidth={16}
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <Line
            x1={494}
            y1={60}
            x2={507}
            y2={30}
            stroke={dark}
            strokeWidth={7}
            strokeLinecap="round"
         />
         <Ellipse cx={511} cy={24} rx={17} ry={10} fill={dark} />
         <Ellipse cx={536} cy={122} rx={11} ry={17} fill={accent} transform="rotate(18 536 122)" />
         <Ellipse cx={108} cy={204} rx={9} ry={13} fill={light} />
      </Svg>
   );
}

function Trails() {
   const accent = useThemeColor('--color-primary', 'primary');
   return (
      <Svg width={300} height={230} viewBox="0 0 300 230">
         <Line
            x1={6}
            y1={104}
            x2={66}
            y2={104}
            stroke={accent}
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.9}
         />
         <Line
            x1={0}
            y1={132}
            x2={82}
            y2={132}
            stroke={accent}
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.55}
         />
         <Line
            x1={12}
            y1={160}
            x2={62}
            y2={160}
            stroke={accent}
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.3}
         />
      </Svg>
   );
}

/**
 * Animated start screen, shown over the app until it is ready: the scooter glides in from the left, the trails
 * unroll behind it, then "ToMo" rises. Opacity and transform only (UI thread). With "reduce motion" it shows
 * the final picture for a moment, without movement.
 */
export function AnimatedSplash({ onDone }: { onDone: () => void }) {
   const top = useThemeColor('--color-background-top', 'backgroundTop');
   const mid = useThemeColor('--color-background', 'background');
   const bottom = useThemeColor('--color-background-bottom', 'backgroundBottom');

   const scooter = useSharedValue(0);
   const trail = useSharedValue(0);
   const title = useSharedValue(0);
   const overlay = useSharedValue(1);

   useEffect(() => {
      const ease = Easing.out(Easing.cubic);
      const opts = { reduceMotion: ReduceMotion.System };
      scooter.value = withTiming(1, { duration: 640, easing: ease, ...opts });
      trail.value = withDelay(120, withTiming(1, { duration: 480, easing: ease, ...opts }));
      title.value = withDelay(360, withTiming(1, { duration: 520, easing: ease, ...opts }));
      overlay.value = withDelay(
         TOTAL - 220,
         withTiming(0, { duration: 220, ...opts }, finished => {
            if (finished) runOnJS(onDone)();
         })
      );
   }, [onDone, overlay, scooter, title, trail]);

   const scooterStyle = useAnimatedStyle(() => ({
      opacity: scooter.value,
      transform: [{ translateX: (1 - scooter.value) * -120 }],
   }));
   const trailStyle = useAnimatedStyle(() => ({
      opacity: trail.value,
      transform: [{ translateX: 150 }, { scaleX: trail.value }, { translateX: -150 }],
   }));
   const titleStyle = useAnimatedStyle(() => ({
      opacity: title.value,
      transform: [{ translateY: (1 - title.value) * 16 }],
   }));
   const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));

   return (
      <Animated.View
         style={[StyleSheet.absoluteFill, overlayStyle]}
         pointerEvents="auto"
         accessibilityLabel="ToMo">
         <LinearGradient
            colors={[top, mid, bottom]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
         />
         <View style={styles.center}>
            <View style={styles.art}>
               <Animated.View style={[StyleSheet.absoluteFill, trailStyle]}>
                  <Trails />
               </Animated.View>
               <Animated.View style={[StyleSheet.absoluteFill, scooterStyle]}>
                  <Scooter />
               </Animated.View>
            </View>
            <Animated.View style={titleStyle}>
               <ThemedText
                  variant="h1"
                  color="primary"
                  className="text-[64px] leading-[68px] tracking-tighter">
                  ToMo
               </ThemedText>
            </Animated.View>
         </View>
      </Animated.View>
   );
}

const styles = StyleSheet.create({
   center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
   art: { width: 300, height: 230 },
});

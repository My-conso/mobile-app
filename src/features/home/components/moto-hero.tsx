import React from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, FadeIn, FadeInLeft, ReduceMotion } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { Row, ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedIcon } from '@/src/components/ui/themed-icon';
import { ThemedPressable } from '@/src/components/ui/themed-pressable';
import { useThemeColor } from '@/src/hooks/use-theme-color';

interface MotoHeroProps {
   photoUri?: string;
   label: string;
   photoLabel: string;
   onPhotoPress: () => void;
}

/** Scooter drawing, coloured from the theme tokens (cyan wheels). */
function MotoDrawing({ label }: { label: string }) {
   const accent = useThemeColor('--color-primary', 'primary');
   const night = useThemeColor('--color-background', 'background');
   const hub = useThemeColor('--color-foreground-faint', 'foregroundFaint');
   const body = useThemeColor('--color-foreground', 'foreground');
   const dark = useThemeColor('--color-background-secondary', 'backgroundSecondary');
   const light = useThemeColor('--color-danger', 'danger');
   return (
      <Svg viewBox="40 0 570 390" width={268} height={183} accessibilityLabel={label}>
         <Circle cx={230} cy={300} r={65} fill={night} />
         <Circle cx={230} cy={300} r={40} fill={accent} />
         <Circle cx={230} cy={300} r={30} fill={night} />
         <Circle cx={230} cy={300} r={9} fill={hub} />
         <Circle cx={520} cy={300} r={65} fill={night} />
         <Circle cx={520} cy={300} r={40} fill={accent} />
         <Circle cx={520} cy={300} r={30} fill={night} />
         <Line
            x1={512}
            y1={215}
            x2={520}
            y2={300}
            stroke={hub}
            strokeWidth={14}
            strokeLinecap="round"
         />
         <Circle cx={520} cy={300} r={9} fill={hub} />
         <Path d="M282 255 L350 255 L338 292 C330 300 300 302 290 292 Z" fill={hub} />
         <Path
            d="M100 205 C112 172 175 172 200 176 L345 184 C362 200 364 240 348 262 L302 262 C292 232 262 216 230 216 C196 216 166 236 158 262 L140 262 C114 250 96 228 100 205 Z"
            fill={body}
         />
         <Path
            d="M190 200 L330 206 C338 216 340 232 334 246 L300 246 C290 226 262 212 232 212 Z"
            fill={accent}
            opacity={0.9}
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
            d="M440 196 L470 118 C474 108 482 104 492 104 L500 106 L466 214 C458 220 450 226 446 232 Z"
            fill={accent}
            opacity={0.9}
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
         <Ellipse cx={536} cy={122} rx={11} ry={17} fill={body} transform="rotate(18 536 122)" />
         <Ellipse cx={108} cy={204} rx={9} ry={13} fill={light} />
      </Svg>
   );
}

/**
 * Picture block of the home screen. Default: the scooter drawing, which glides in from the left.
 * With a photo: the photo settles in (zoom 1.14 → 1), darkened and faded into the background at the top and bottom.
 */
export function MotoHero({ photoUri, label, photoLabel, onPhotoPress }: MotoHeroProps) {
   const night = useThemeColor('--color-background', 'background');
   return (
      <ThemedView bg="transparent" className="h-44 items-center justify-end">
         {photoUri ? (
            <Animated.View
               entering={FadeIn.duration(760)
                  .easing(Easing.out(Easing.cubic))
                  .withInitialValues({ opacity: 0, transform: [{ scale: 1.14 }] })
                  .reduceMotion(ReduceMotion.System)}
               style={StyleSheet.absoluteFill}
               className="overflow-hidden rounded-3xl">
               <Image
                  source={{ uri: photoUri }}
                  contentFit="cover"
                  style={StyleSheet.absoluteFill}
                  accessibilityLabel={label}
               />
               <ThemedView className="bg-background/30" style={StyleSheet.absoluteFill} />
               <LinearGradient
                  colors={[night, 'transparent']}
                  style={styles.fadeTop}
                  pointerEvents="none"
               />
               <LinearGradient
                  colors={['transparent', night]}
                  style={styles.fadeBottom}
                  pointerEvents="none"
               />
            </Animated.View>
         ) : (
            <>
               <Animated.View
                  entering={FadeInLeft.delay(80)
                     .duration(640)
                     .easing(Easing.out(Easing.cubic))
                     .withInitialValues({ opacity: 0, transform: [{ translateX: -46 }] })
                     .reduceMotion(ReduceMotion.System)}>
                  <MotoDrawing label={label} />
               </Animated.View>
            </>
         )}
         <ThemedPressable
            accessibilityLabel={photoLabel}
            onPress={onPhotoPress}
            className="absolute top-0 right-0">
            <Row items="center" gap="xs" bg="card" className="h-8 rounded-full px-3 opacity-90">
               <ThemedIcon name="camera" size="xs" color="secondary" />
               <ThemedText variant="caption" color="secondary">
                  {photoLabel}
               </ThemedText>
            </Row>
         </ThemedPressable>
      </ThemedView>
   );
}

const styles = StyleSheet.create({
   fadeTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 56 },
   fadeBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 56 },
});

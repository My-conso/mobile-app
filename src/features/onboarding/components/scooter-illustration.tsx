import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { ThemedView } from '@/src/components/ui/themed-view';
import { useThemeColor } from '@/src/hooks/use-theme-color';

/** Scooter drawing for the welcome step, coloured from the theme tokens. */
export function ScooterIllustration({ label }: { label: string }) {
   const neon = useThemeColor('--color-primary', 'primary');
   const coral = useThemeColor('--color-danger', 'danger');
   const body = useThemeColor('--color-foreground', 'foreground');
   const shadow = useThemeColor('--color-card', 'card');
   const wheel = useThemeColor('--color-border', 'border');
   const rim = useThemeColor('--color-foreground-faint', 'foregroundFaint');
   const dark = useThemeColor('--color-background-secondary', 'backgroundSecondary');
   const engine = useThemeColor('--color-foreground-muted', 'foregroundMuted');

   return (
      <ThemedView
         bg="transparent"
         className="items-center"
         accessible
         accessibilityRole="image"
         accessibilityLabel={label}>
         <Svg viewBox="30 0 570 390" width="100%" height={234}>
            <Ellipse cx={375} cy={372} rx={215} ry={10} fill={shadow} />
            <Line
               x1={60}
               y1={150}
               x2={125}
               y2={150}
               stroke={neon}
               strokeWidth={10}
               strokeLinecap="round"
               opacity={0.9}
            />
            <Line
               x1={40}
               y1={185}
               x2={125}
               y2={185}
               stroke={neon}
               strokeWidth={10}
               strokeLinecap="round"
               opacity={0.6}
            />
            <Line
               x1={60}
               y1={220}
               x2={125}
               y2={220}
               stroke={neon}
               strokeWidth={10}
               strokeLinecap="round"
               opacity={0.35}
            />
            <Circle cx={230} cy={300} r={65} fill={wheel} />
            <Circle cx={230} cy={300} r={34} fill={rim} />
            <Circle cx={230} cy={300} r={10} fill={wheel} />
            <Circle cx={520} cy={300} r={65} fill={wheel} />
            <Circle cx={520} cy={300} r={34} fill={rim} />
            <Line
               x1={512}
               y1={215}
               x2={520}
               y2={300}
               stroke={dark}
               strokeWidth={14}
               strokeLinecap="round"
            />
            <Circle cx={520} cy={300} r={10} fill={wheel} />
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
            <Ellipse cx={536} cy={122} rx={11} ry={17} fill={neon} transform="rotate(18 536 122)" />
            <Ellipse cx={108} cy={204} rx={9} ry={13} fill={coral} />
         </Svg>
      </ThemedView>
   );
}

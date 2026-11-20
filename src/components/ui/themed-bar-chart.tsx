import React, { useEffect, useState } from 'react';
import Animated, {
   Easing,
   ReduceMotion,
   useAnimatedStyle,
   useSharedValue,
   withDelay,
   withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/src/hooks/use-theme-color';

export interface BarItem {
   label: string;
   value: number;
}

interface BarChartProps {
   items: BarItem[];
   /** Dashed horizontal reference line (the average) */
   average?: number | null;
   /** Formats the figures printed above the bars and on the y axis */
   format: (v: number) => string;
   /** Accessible description of the whole chart */
   label: string;
}

const HEIGHT = 214;
const PAD = { top: 22, right: 4, bottom: 26, left: 34 };
const MAX_BAR = 34;

/** Thin bars per fill-up, the last one highlighted, dashed average line. Theme-aware SVG. */
/** The whole chart grows from its baseline in one go: a single transform on one layer, no SVG redraw per frame. */
function useGrow() {
   const p = useSharedValue(0);
   useEffect(() => {
      p.value = withDelay(
         150,
         withTiming(1, {
            duration: 450,
            easing: Easing.out(Easing.cubic),
            reduceMotion: ReduceMotion.System,
         })
      );
   }, [p]);
   return useAnimatedStyle(() => ({
      opacity: p.value,
      transform: [{ scaleY: 0.55 + 0.45 * p.value }],
   }));
}

export function BarChart({ items, average, format, label }: BarChartProps) {
   const [width, setWidth] = useState(0);
   const grow = useGrow();
   const bar = useThemeColor('--color-border', 'border');
   const highlight = useThemeColor('--color-primary', 'primary');
   const muted = useThemeColor('--color-foreground-muted', 'foregroundMuted');
   const text = useThemeColor('--color-foreground', 'foreground');
   const dashed = useThemeColor('--color-foreground-muted', 'foregroundMuted');

   const values = items.map(i => i.value).concat(average != null ? [average] : []);
   const min = Math.min(...values);
   const max = Math.max(...values);
   const pad = (max - min) * 0.3 || 0.3;
   const lo = Math.max(0, min - pad);
   const hi = max + pad;

   const innerW = Math.max(width - PAD.left - PAD.right, 1);
   const innerH = HEIGHT - PAD.top - PAD.bottom;
   const slot = innerW / Math.max(items.length, 1);
   const barW = Math.min(slot * 0.5, MAX_BAR);
   const y = (v: number) => PAD.top + innerH - ((v - lo) / (hi - lo)) * innerH;
   const base = PAD.top + innerH;
   const ticks = [hi - pad * 0.3, (hi + lo) / 2, lo + pad * 0.3];

   return (
      <ThemedView
         bg="transparent"
         onLayout={e => setWidth(e.nativeEvent.layout.width)}
         accessible
         accessibilityRole="image"
         accessibilityLabel={label}>
         {width > 0 && (
            <Animated.View
               style={[{ transformOrigin: 'bottom' }, grow]}
               renderToHardwareTextureAndroid>
               <Svg width={width} height={HEIGHT}>
                  {ticks.map((t, i) => (
                     <SvgText
                        key={i}
                        x={PAD.left - 8}
                        y={y(t) + 4}
                        fontSize={11}
                        fill={muted}
                        textAnchor="end">
                        {format(t)}
                     </SvgText>
                  ))}
                  <Line
                     x1={PAD.left}
                     x2={width - PAD.right}
                     y1={base}
                     y2={base}
                     stroke={bar}
                     strokeWidth={1}
                  />
                  {items.map((it, i) => {
                     const last = i === items.length - 1;
                     const cx = PAD.left + slot * i + slot / 2;
                     const top = y(it.value);
                     return (
                        <React.Fragment key={i}>
                           <Rect
                              x={cx - barW / 2}
                              y={top}
                              width={barW}
                              height={Math.max(base - top, 2)}
                              rx={7}
                              fill={last ? highlight : bar}
                           />
                           <SvgText
                              x={cx}
                              y={top - 7}
                              fontSize={13}
                              fontWeight="600"
                              fill={last ? highlight : text}
                              textAnchor="middle">
                              {format(it.value)}
                           </SvgText>
                           <SvgText
                              x={cx}
                              y={HEIGHT - 6}
                              fontSize={12}
                              fill={muted}
                              textAnchor="middle">
                              {it.label}
                           </SvgText>
                        </React.Fragment>
                     );
                  })}
                  {average != null && (
                     <Line
                        x1={PAD.left}
                        x2={width - PAD.right}
                        y1={y(average)}
                        y2={y(average)}
                        stroke={dashed}
                        strokeWidth={2}
                        strokeDasharray="6 5"
                     />
                  )}
               </Svg>
            </Animated.View>
         )}
      </ThemedView>
   );
}

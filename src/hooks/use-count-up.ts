import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

interface CountUpOptions {
   /** Start value (default: 70 % of the target) */
   from?: number;
   /** Duration in ms */
   duration?: number;
}

/**
 * Number that "rolls" up to its target (ease-out cubic, slows at the end).
 * Skipped when the phone's "reduce motion" setting is on: the target shows immediately.
 */
export function useCountUp(target: number, { from, duration = 700 }: CountUpOptions = {}): number {
   const [value, setValue] = useState(target);

   useEffect(() => {
      let raf = 0;
      let cancelled = false;
      AccessibilityInfo.isReduceMotionEnabled().then(reduce => {
         if (cancelled) return;
         if (reduce) {
            setValue(target);
            return;
         }
         const start = from ?? target * 0.7;
         const t0 = Date.now();
         const step = () => {
            const p = Math.min(1, (Date.now() - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(start + (target - start) * eased);
            if (p < 1) raf = requestAnimationFrame(step);
         };
         step();
      });
      return () => {
         cancelled = true;
         cancelAnimationFrame(raf);
      };
   }, [target, from, duration]);

   return value;
}

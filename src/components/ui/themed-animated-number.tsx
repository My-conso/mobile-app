import React from 'react';
import { ThemedText, type ThemedTextProps } from './themed-text';
import { useCountUp } from '@/src/hooks/use-count-up';
import { formatNumber } from '@/src/lib/format';

interface AnimatedNumberProps extends Omit<ThemedTextProps, 'children' | 'numeric'> {
   value: number;
   decimals?: number;
}

/** Figure that rolls up to its value when it appears (see `useCountUp`). */
export function AnimatedNumber({ value, decimals = 0, ...textProps }: AnimatedNumberProps) {
   const shown = useCountUp(value);
   return (
      <ThemedText numeric {...textProps}>
         {formatNumber(shown, decimals)}
      </ThemedText>
   );
}

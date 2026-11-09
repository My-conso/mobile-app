import React from 'react';
import { Row, ThemedView } from './themed-view';
import { cn } from '@/src/utils/tailwind';

interface MiniBarsProps {
   values: number[];
   /** Accessible description of the values */
   label: string;
}

/** Tiny bar sparkline: the last bar is highlighted. Heights are relative to the largest value. */
export function MiniBars({ values, label }: MiniBarsProps) {
   const max = Math.max(...values, 0.0001);
   return (
      <Row items="end" gap="sm" bg="transparent" className="h-13" accessible accessibilityRole="image" accessibilityLabel={label}>
         {values.map((v, i) => (
            <ThemedView
               key={i}
               rounded="sm"
               className={cn('w-3.5', i === values.length - 1 ? 'bg-foreground' : 'bg-border')}
               // bar height is data-driven
               style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
            />
         ))}
      </Row>
   );
}

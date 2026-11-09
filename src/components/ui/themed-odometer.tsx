import React from 'react';
import { Row, ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { formatKm } from '@/src/lib/format';

interface OdometerProps {
   km: number;
   /** Number of digit boxes (default 6) */
   digits?: number;
}

/** Odometer-style counter: one box per digit, leading zeros dimmed. */
export function Odometer({ km, digits = 6 }: OdometerProps) {
   const text = String(Math.max(0, Math.round(km))).padStart(digits, '0').slice(-digits);
   const firstSignificant = text.search(/[1-9]/);
   return (
      <Row gap="xs" bg="transparent" accessible accessibilityLabel={`${formatKm(km)} km`}>
         {text.split('').map((d, i) => (
            <ThemedView key={i} rounded="chip" className="bg-background-secondary h-10 w-[30px] items-center justify-center">
               <ThemedText numeric weight="semibold" className="text-[22px]" color={firstSignificant === -1 || i < firstSignificant ? 'faint' : 'default'}>
                  {d}
               </ThemedText>
            </ThemedView>
         ))}
      </Row>
   );
}

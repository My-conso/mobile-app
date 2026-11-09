import React from 'react';
import { ThemedView, Row } from './themed-view';
import { ThemedText } from './themed-text';

interface StatCardProps {
   label: string;
   value: string;
   unit?: string;
   className?: string;
}

/** Small figure tile: caption on top, big figure (Space Grotesk) and its unit below. */
export function StatCard({ label, value, unit, className }: StatCardProps) {
   return (
      <ThemedView variant="card" padding="md" gap="sm" className={`rounded-[18px] ${className ?? ''}`}>
         <ThemedText variant="caption" color="secondary" numberOfLines={2}>
            {label}
         </ThemedText>
         <Row items="baseline" gap="xs" wrap="wrap" bg="transparent">
            <ThemedText numeric weight="semibold" className="text-[22px]" numberOfLines={1} adjustsFontSizeToFit>
               {value}
            </ThemedText>
            {unit ? (
               <ThemedText variant="body-small" weight="medium" color="secondary">
                  {unit}
               </ThemedText>
            ) : null}
         </Row>
      </ThemedView>
   );
}

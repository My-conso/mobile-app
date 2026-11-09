import React from 'react';
import { Row, ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { cn } from '@/src/utils/tailwind';

export type StatusTone = 'neutral' | 'muted' | 'attention' | 'positive' | 'danger';

const DOT: Record<StatusTone, string> = {
   neutral: 'bg-foreground-secondary',
   muted: 'bg-foreground-muted',
   attention: 'bg-accent',
   positive: 'bg-primary',
   danger: 'bg-danger',
};

const TEXT: Record<StatusTone, 'secondary' | 'muted' | 'accent' | 'primary' | 'danger'> = {
   neutral: 'secondary',
   muted: 'muted',
   attention: 'accent',
   positive: 'primary',
   danger: 'danger',
};

/** Small coloured dot + label (history badges: partial, starting point, not computed…). */
export function Status({ label, tone = 'neutral' }: { label: string; tone?: StatusTone }) {
   return (
      <Row items="center" gap="sm" bg="transparent">
         <ThemedView className={cn('size-1.5 rounded-full', DOT[tone])} />
         <ThemedText variant="caption" weight="medium" color={TEXT[tone]} numberOfLines={1}>
            {label}
         </ThemedText>
      </Row>
   );
}

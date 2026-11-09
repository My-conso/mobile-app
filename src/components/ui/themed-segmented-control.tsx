import React from 'react';
import { Row } from './themed-view';
import { ThemedText } from './themed-text';
import { ThemedPressable } from './themed-pressable';
import { cn } from '@/src/utils/tailwind';

interface Option<T extends string> {
   value: T;
   label: string;
}

export function SegmentedControl<T extends string>({
   options,
   value,
   onChange,
}: {
   options: Option<T>[];
   value: T;
   onChange: (v: T) => void;
}) {
   return (
      <Row rounded="full" padding="xs" gap="xs" className="bg-card border-border border" accessibilityRole="radiogroup">
         {options.map(o => {
            const active = o.value === value;
            return (
               <ThemedPressable
                  key={o.value}
                  onPress={() => onChange(o.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active, checked: active }}
                  className={cn('min-h-11 flex-1 items-center justify-center rounded-full px-1', active ? 'bg-primary' : '')}>
                  {/* One line only: shrink the text instead of wrapping on narrow screens */}
                  <ThemedText
                     variant="body-small"
                     weight={active ? 'semibold' : 'normal'}
                     color={active ? 'inverse' : 'secondary'}
                     numberOfLines={1}
                     adjustsFontSizeToFit
                     minimumFontScale={0.75}>
                     {o.label}
                  </ThemedText>
               </ThemedPressable>
            );
         })}
      </Row>
   );
}

import React from 'react';
import { Row, ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { ThemedSwitch } from './themed-switch';

/** Label (+ optional help) on the left, switch on the right. Put several in a `RowGroup`. */
export function SwitchRow({
   label,
   help,
   value,
   onValueChange,
}: {
   label: string;
   help?: string;
   value: boolean;
   onValueChange: (v: boolean) => void;
}) {
   return (
      <Row items="center" gap="md" bg="transparent" className="min-h-12 px-4 py-3">
         <ThemedView bg="transparent" gap="xs" className="flex-1">
            <ThemedText variant="body">{label}</ThemedText>
            {help ? (
               <ThemedText variant="caption" color="muted">
                  {help}
               </ThemedText>
            ) : null}
         </ThemedView>
         <ThemedSwitch value={value} onValueChange={onValueChange} accessibilityLabel={label} />
      </Row>
   );
}

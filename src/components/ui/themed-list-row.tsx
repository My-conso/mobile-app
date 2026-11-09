import React from 'react';
import { Row } from './themed-view';
import { ThemedText } from './themed-text';
import { ThemedIcon, type IconName } from './themed-icon';
import { ThemedPressable } from './themed-pressable';

interface ListRowProps {
   label: string;
   value?: string;
   /** primary = call to action ("À renseigner"), danger = destructive row */
   tone?: 'default' | 'primary' | 'danger';
   icon?: IconName;
   chevron?: boolean;
   onPress?: () => void;
   accessibilityLabel?: string;
}

/** Settings-style row: [icon] label ...... value  > */
export function ListRow({ label, value, tone = 'default', icon, chevron = true, onPress, accessibilityLabel }: ListRowProps) {
   return (
      <ThemedPressable onPress={onPress} accessibilityLabel={accessibilityLabel ?? label} className="min-h-13">
         <Row items="center" gap="md" bg="transparent" className="min-h-13 px-4">
            {icon ? <ThemedIcon name={icon} color={tone === 'danger' ? 'danger' : 'secondary'} /> : null}
            <ThemedText variant="body" color={tone === 'danger' ? 'danger' : 'default'} className="flex-1" numberOfLines={1}>
               {label}
            </ThemedText>
            {value ? (
               <ThemedText variant="body" weight={tone === 'primary' ? 'medium' : 'normal'} color={tone === 'primary' ? 'primary' : 'secondary'} numberOfLines={1} className="max-w-[55%]">
                  {value}
               </ThemedText>
            ) : null}
            {chevron ? <ThemedIcon name="chevron-right" color="muted" size="sm" /> : null}
         </Row>
      </ThemedPressable>
   );
}

import React from 'react';
import { Row } from '../ui/themed-view';
import { ThemedText } from '../ui/themed-text';
import { ThemedIcon } from '../ui/themed-icon';
import { ThemedPressable } from '../ui/themed-pressable';

interface ScreenHeaderProps {
   title: string;
   onBack: () => void;
   backLabel: string;
   /** Optional content on the right (e.g. a vehicle badge) */
   right?: React.ReactNode;
}

/** Header of stacked/modal screens: round back button, centred title, optional right content. */
export function ScreenHeader({ title, onBack, backLabel, right }: ScreenHeaderProps) {
   return (
      <Row items="center" justify="between" gap="sm" bg="transparent" className="px-5 pt-3 pb-2">
         <ThemedPressable
            onPress={onBack}
            accessibilityLabel={backLabel}
            hitSlop={8}
            className="border-border size-11 items-center justify-center rounded-full border">
            <ThemedIcon name="chevron-left" size="lg" />
         </ThemedPressable>
         <ThemedText variant="h3" numberOfLines={1} className="shrink">
            {title}
         </ThemedText>
         {right ?? <Row bg="transparent" className="w-11" />}
      </Row>
   );
}

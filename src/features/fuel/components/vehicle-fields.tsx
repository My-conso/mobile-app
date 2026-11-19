import React, { useRef } from 'react';
import type { TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Row, ThemedView } from '@/src/components/ui/themed-view';
import { ThemedInput } from '@/src/components/ui/themed-input';
import type { VehicleDraftErrors, VehicleDraftInput } from '@/src/lib/validation';

interface VehicleFieldsProps {
   draft: VehicleDraftInput;
   onChange: (patch: Partial<VehicleDraftInput>) => void;
   /** Errors to show (the parent decides when: after a first submit) */
   errors?: VehicleDraftErrors;
   /** Ref to the tank input (to focus it from the parent) */
   tankRef?: React.Ref<TextInput>;
   /** Reports the tank field's vertical position inside the parent's scroll content */
   onTankLayout?: (y: number) => void;
   /** Pulses a highlight ring around the tank input when it turns true */
   highlightTank?: boolean;
}

/** Brand / model / year (required) and engine size / tank (optional): shared by onboarding and the vehicle form. */
export function VehicleFields({
   draft,
   onChange,
   errors = {},
   tankRef,
   onTankLayout,
   highlightTank,
}: VehicleFieldsProps) {
   const { t } = useTranslation('fuel');
   const optional = (label: string) => `${label} · ${t('common.optional')}`;
   const yearError =
      errors.year === 'invalid'
         ? t('onboarding.year_invalid')
         : errors.year
           ? t('common.required')
           : undefined;

   // The tank field's y is relative to this container, which is itself a child of the scroll content
   const rootY = useRef<number | null>(null);
   const tankY = useRef<number | null>(null);
   const report = () => {
      if (rootY.current != null && tankY.current != null)
         onTankLayout?.(rootY.current + tankY.current);
   };

   return (
      <ThemedView
         gap="lg"
         bg="transparent"
         onLayout={e => {
            rootY.current = e.nativeEvent.layout.y;
            report();
         }}>
         <ThemedInput
            label={t('onboarding.brand')}
            placeholder="Yamaha"
            value={draft.brand}
            onChangeText={brand => onChange({ brand })}
            autoCapitalize="words"
            error={errors.brand ? t('common.required') : undefined}
         />
         <ThemedInput
            label={t('onboarding.model')}
            placeholder="Cygnus X"
            value={draft.model}
            onChangeText={model => onChange({ model })}
            autoCapitalize="words"
            error={errors.model ? t('common.required') : undefined}
         />
         <Row gap="md" items="start" bg="transparent">
            <ThemedView bg="transparent" className="flex-1">
               <ThemedInput
                  label={t('onboarding.year')}
                  placeholder="2013"
                  value={draft.year}
                  onChangeText={year => onChange({ year })}
                  keyboardType="number-pad"
                  maxLength={4}
                  numeric
                  error={yearError}
               />
            </ThemedView>
            <ThemedView bg="transparent" className="flex-1">
               <ThemedInput
                  label={optional(t('onboarding.cc'))}
                  placeholder="125"
                  value={draft.cc}
                  onChangeText={cc => onChange({ cc })}
                  keyboardType="number-pad"
                  numeric
               />
            </ThemedView>
         </Row>
         <ThemedView
            bg="transparent"
            onLayout={e => {
               tankY.current = e.nativeEvent.layout.y;
               report();
            }}>
            <ThemedInput
               ref={tankRef}
               pulse={highlightTank}
               label={optional(t('onboarding.tank'))}
               placeholder="—"
               value={draft.tank}
               onChangeText={tank => onChange({ tank })}
               keyboardType="decimal-pad"
               numeric
               suffix={t('unit.l')}
            />
         </ThemedView>
      </ThemedView>
   );
}

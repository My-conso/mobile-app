import React, { useEffect, useRef } from 'react';
import type { TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
   useAnimatedStyle,
   useSharedValue,
   withSequence,
   withTiming,
   ReduceMotion,
} from 'react-native-reanimated';
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
   /** Pulses a highlight ring around the tank field when it turns true */
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

   // Highlight ring: fades in and out twice
   const ring = useSharedValue(0);
   useEffect(() => {
      if (!highlightTank) return;
      ring.value = withSequence(
         withTiming(1, { duration: 280, reduceMotion: ReduceMotion.System }),
         withTiming(0.25, { duration: 280, reduceMotion: ReduceMotion.System }),
         withTiming(1, { duration: 280, reduceMotion: ReduceMotion.System }),
         withTiming(0, { duration: 600, reduceMotion: ReduceMotion.System })
      );
   }, [highlightTank, ring]);
   const ringStyle = useAnimatedStyle(() => ({
      opacity: ring.value,
      transform: [{ scale: 0.985 + ring.value * 0.015 }],
   }));

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
            <Animated.View
               pointerEvents="none"
               style={ringStyle}
               className="border-primary absolute -inset-2 rounded-2xl border-2"
            />
            <ThemedInput
               ref={tankRef}
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

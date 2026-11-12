import React, { useState } from 'react';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { Screen } from '@/src/components/layout/screen';
import { ScrollContainer } from '@/src/components/layout/scroll-container';
import { Row, ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedButton } from '@/src/components/ui/themed-button';
import { ThemedIcon } from '@/src/components/ui/themed-icon';
import { ThemedPressable } from '@/src/components/ui/themed-pressable';
import { VehicleFields } from '@/src/features/fuel/components/vehicle-fields';
import { useFuelStore } from '@/src/features/fuel/store';
import { vehicleName } from '@/src/features/fuel/types';
import { validateVehicleDraft, type VehicleDraftInput } from '@/src/lib/validation';
import type { LanguageCodeSupportedT } from '@/src/i18n/types';
import { navigateWhenReady } from '@/src/navigation/navigation-ref';
import { cn } from '@/src/utils/tailwind';
import { ScooterIllustration } from '../components/scooter-illustration';

type Step = 1 | 2 | 3;

const LANGUAGES: { code: LanguageCodeSupportedT; badge: string; name: string }[] = [
   { code: 'fr', badge: 'FR', name: 'Français' },
   { code: 'mg', badge: 'MG', name: 'Malagasy' },
];

const EMPTY: VehicleDraftInput = { brand: '', model: '', year: '', cc: '', tank: '' };

/**
 * First launch, once: language (nothing preselected) → bike (brand, model, year required) → welcome.
 * No "skip" button. The flow ends by creating the first vehicle, which also marks onboarding as done.
 */
export function OnboardingScreen() {
   const { t } = useTranslation('fuel');
   const completeOnboarding = useFuelStore(s => s.completeOnboarding);
   const [step, setStep] = useState<Step>(1);
   const [lang, setLang] = useState<LanguageCodeSupportedT | null>(null);
   const [langError, setLangError] = useState(false);
   const [draft, setDraft] = useState<VehicleDraftInput>(EMPTY);
   const [showErrors, setShowErrors] = useState(false);

   const result = validateVehicleDraft(draft);
   const bikeName = vehicleName(result.value) || (lang === 'mg' ? 'moto' : 'moto');

   const pickLanguage = (code: LanguageCodeSupportedT) => {
      setLang(code);
      setLangError(false);
      i18next.changeLanguage(code); // also persisted by the language detector
   };

   const next = () => {
      if (step === 1) {
         if (!lang) {
            setLangError(true);
            return;
         }
         setStep(2);
      } else if (step === 2) {
         if (result.hasErrors) {
            setShowErrors(true);
            return;
         }
         setStep(3);
      }
   };

   // Creates the bike, then opens the first fill-up form straight away (the home screen stays behind it)
   const finish = () => {
      completeOnboarding(result.value);
      navigateWhenReady('FuelForm');
   };

   return (
      <Screen withKeyboardAvoiding withSmallPadding={false}>
         <Row items="center" justify="between" bg="transparent" className="min-h-11 px-6 pt-6">
            {step === 2 ? (
               <ThemedPressable
                  onPress={() => {
                     setStep(1);
                     setShowErrors(false);
                  }}
                  accessibilityLabel={t('common.back')}
                  className="border-border size-11 items-center justify-center rounded-full border">
                  <ThemedIcon name="chevron-left" size="lg" />
               </ThemedPressable>
            ) : (
               <ThemedText numeric weight="bold" color="primary" className="text-lg">
                  ToMo
               </ThemedText>
            )}
            {step !== 3 ? (
               <Row items="center" gap="md" bg="transparent">
                  <ThemedText variant="caption" color="muted">
                     {t('onboarding.step', { step })}
                  </ThemedText>
                  <Row gap="xs" bg="transparent">
                     <ThemedView className="bg-primary h-1 w-[18px] rounded-sm" />
                     <ThemedView className={cn('h-1 w-[18px] rounded-sm', step >= 2 ? 'bg-primary' : 'bg-border')} />
                  </Row>
               </Row>
            ) : null}
         </Row>

         {step === 1 ? (
            <Animated.View entering={FadeInDown.duration(260).reduceMotion(ReduceMotion.System)} className="flex-1 gap-7 px-6 pt-10">
               <ThemedView bg="transparent" gap="sm">
                  {/* Both languages on purpose: the user hasn't chosen one yet */}
                  <ThemedText variant="h1" className="leading-9">
                     Choisis ta langue
                  </ThemedText>
                  <ThemedText variant="body-large" color="secondary">
                     Safidio ny fiteninao
                  </ThemedText>
               </ThemedView>
               <ThemedView bg="transparent" gap="md" accessibilityRole="radiogroup">
                  {LANGUAGES.map(l => {
                     const active = lang === l.code;
                     return (
                        <ThemedPressable
                           key={l.code}
                           accessibilityRole="radio"
                           accessibilityState={{ checked: active }}
                           onPress={() => pickLanguage(l.code)}
                           className={cn(
                              'min-h-18 flex-row items-center gap-3.5 rounded-card border-[1.5px] px-[18px]',
                              active ? 'bg-primary-soft border-primary' : 'bg-card border-border',
                           )}>
                           <ThemedView className="bg-background-secondary size-10 items-center justify-center rounded-md">
                              <ThemedText numeric weight="semibold" variant="body-small" color="secondary">
                                 {l.badge}
                              </ThemedText>
                           </ThemedView>
                           <ThemedText variant="body-large" weight="medium" className="flex-1">
                              {l.name}
                           </ThemedText>
                           <ThemedView className={cn('size-6 items-center justify-center rounded-full border-2', active ? 'border-primary' : 'border-foreground-faint')}>
                              <ThemedView className={cn('size-3 rounded-full', active ? 'bg-primary' : 'bg-transparent')} />
                           </ThemedView>
                        </ThemedPressable>
                     );
                  })}
               </ThemedView>
               {langError ? (
                  <ThemedText variant="caption" color="danger">
                     Choisis une langue · Misafidiana fiteny
                  </ThemedText>
               ) : null}
            </Animated.View>
         ) : null}

         {step === 2 ? (
            <Animated.View entering={FadeInDown.duration(260).reduceMotion(ReduceMotion.System)} className="flex-1">
               <ScrollContainer contentContainerClassName="gap-5 px-6 pt-7 pb-4" keyboardShouldPersistTaps="handled">
                  <ThemedView bg="transparent" gap="sm">
                     <ThemedText variant="h1" className="text-[28px]">
                        {t('onboarding.bike_title')}
                     </ThemedText>
                     <ThemedText variant="body-small" color="secondary" className="leading-6">
                        {t('onboarding.bike_sub')}
                     </ThemedText>
                  </ThemedView>
                  <VehicleFields draft={draft} onChange={patch => setDraft(d => ({ ...d, ...patch }))} errors={showErrors ? result.errors : undefined} />
               </ScrollContainer>
            </Animated.View>
         ) : null}

         {step === 3 ? (
            <Animated.View entering={FadeInDown.duration(260).reduceMotion(ReduceMotion.System)} className="flex-1 justify-center gap-7 px-6">
               <ScooterIllustration label={t('onboarding.scooter_alt')} />
               <ThemedView bg="transparent" gap="md">
                  <ThemedText variant="h1" className="text-[28px] leading-8">
                     {t('onboarding.done_title', { name: bikeName })}
                  </ThemedText>
                  <ThemedText variant="body" color="secondary" className="leading-6">
                     {t('onboarding.done_body')}
                  </ThemedText>
               </ThemedView>
            </Animated.View>
         ) : null}

         <ThemedView bg="transparent" className="px-6 pt-4 pb-9">
            {step === 3 ? (
               <ThemedButton title={t('onboarding.done_cta')} size="lg" fullWidth onPress={finish} />
            ) : (
               <ThemedButton title={step === 2 ? t('onboarding.finish') : lang === 'mg' ? 'Tohizo' : 'Continuer'} size="lg" fullWidth onPress={next} />
            )}
         </ThemedView>
      </Screen>
   );
}

import React, { useState } from 'react';
import Animated, {
   Easing,
   FadeIn,
   FadeInLeft,
   ReduceMotion,
   useAnimatedStyle,
   useSharedValue,
   withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { Screen } from '@/src/components/layout/screen';
import { FormFooter } from '@/src/components/layout/form-footer';
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
import { Cascade } from '@/src/components/ui/themed-cascade';
import { useShake } from '@/src/hooks/use-shake';
import { haptic } from '@/src/lib/haptics';
import { ScooterIllustration } from '../components/scooter-illustration';

type Step = 1 | 2 | 3;

/** A new step slides in 28 px from the right while fading in (340 ms). */
const stepIn = FadeIn.duration(340)
   .easing(Easing.out(Easing.cubic))
   .withInitialValues({ opacity: 0, transform: [{ translateX: 28 }] })
   .reduceMotion(ReduceMotion.System);

/** Language choice card: the selected one grows slightly (1.025) with a soft ring. */
function LanguageCard({
   active,
   children,
   onPress,
}: {
   active: boolean;
   children: React.ReactNode;
   onPress: () => void;
}) {
   const scale = useSharedValue(1);
   React.useEffect(() => {
      scale.value = withTiming(active ? 1.025 : 1, {
         duration: 160,
         reduceMotion: ReduceMotion.System,
      });
   }, [active, scale]);
   const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
   return (
      <Animated.View style={style}>
         <ThemedPressable
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            onPress={onPress}
            className={cn(
               'min-h-18 flex-row items-center gap-3.5 rounded-card border-[1.5px] px-[18px]',
               active ? 'bg-primary-soft border-primary' : 'bg-card border-border'
            )}>
            {children}
         </ThemedPressable>
      </Animated.View>
   );
}

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
      if (code !== lang) haptic.selection();
      setLang(code);
      setLangError(false);
      i18next.changeLanguage(code); // also persisted by the language detector
   };

   const langShake = useShake();
   const formShake = useShake();

   const next = () => {
      if (step === 1) {
         if (!lang) {
            setLangError(true);
            langShake.shake();
            return;
         }
         setStep(2);
      } else if (step === 2) {
         if (result.hasErrors) {
            setShowErrors(true);
            formShake.shake();
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
                     <ThemedView
                        className={cn(
                           'h-1 w-[18px] rounded-sm',
                           step >= 2 ? 'bg-primary' : 'bg-border'
                        )}
                     />
                  </Row>
               </Row>
            ) : null}
         </Row>

         {step === 1 ? (
            <Animated.View entering={stepIn} className="flex-1 gap-7 px-6 pt-10">
               <ThemedView bg="transparent" gap="sm">
                  {/* Both languages on purpose: the user hasn't chosen one yet */}
                  <ThemedText variant="h1" className="leading-9">
                     Choisis ta langue
                  </ThemedText>
                  <ThemedText variant="body-large" color="secondary">
                     Safidio ny fiteninao
                  </ThemedText>
               </ThemedView>
               <Animated.View
                  style={langShake.style}
                  className="gap-3"
                  accessibilityRole="radiogroup">
                  {LANGUAGES.map(l => {
                     const active = lang === l.code;
                     return (
                        <LanguageCard
                           key={l.code}
                           active={active}
                           onPress={() => pickLanguage(l.code)}>
                           <ThemedView className="bg-background-secondary size-10 items-center justify-center rounded-md">
                              <ThemedText
                                 numeric
                                 weight="semibold"
                                 variant="body-small"
                                 color="secondary">
                                 {l.badge}
                              </ThemedText>
                           </ThemedView>
                           <ThemedText variant="body-large" weight="medium" className="flex-1">
                              {l.name}
                           </ThemedText>
                           <ThemedView
                              className={cn(
                                 'size-6 items-center justify-center rounded-full border-2',
                                 active ? 'border-primary' : 'border-foreground-faint'
                              )}>
                              <ThemedView
                                 className={cn(
                                    'size-3 rounded-full',
                                    active ? 'bg-primary' : 'bg-transparent'
                                 )}
                              />
                           </ThemedView>
                        </LanguageCard>
                     );
                  })}
               </Animated.View>
               {langError ? (
                  <ThemedText variant="caption" color="danger">
                     Choisis une langue · Misafidiana fiteny
                  </ThemedText>
               ) : null}
            </Animated.View>
         ) : null}

         {step === 2 ? (
            <Animated.View entering={stepIn} className="flex-1">
               <ScrollContainer
                  keyboardAware
                  contentContainerClassName="gap-5 px-6 pt-7 pb-4"
                  keyboardShouldPersistTaps="handled">
                  <ThemedView bg="transparent" gap="sm">
                     <ThemedText variant="h1" className="text-[28px]">
                        {t('onboarding.bike_title')}
                     </ThemedText>
                     <ThemedText variant="body-small" color="secondary" className="leading-6">
                        {t('onboarding.bike_sub')}
                     </ThemedText>
                  </ThemedView>
                  <Animated.View style={formShake.style}>
                     <VehicleFields
                        draft={draft}
                        onChange={patch => setDraft(d => ({ ...d, ...patch }))}
                        errors={showErrors ? result.errors : undefined}
                     />
                  </Animated.View>
               </ScrollContainer>
            </Animated.View>
         ) : null}

         {step === 3 ? (
            <Animated.View entering={stepIn} className="flex-1 justify-center gap-7 px-6">
               <Animated.View
                  entering={FadeInLeft.delay(120)
                     .duration(800)
                     .easing(Easing.out(Easing.cubic))
                     .withInitialValues({ opacity: 0, transform: [{ translateX: -90 }] })
                     .reduceMotion(ReduceMotion.System)}>
                  <ScooterIllustration label={t('onboarding.scooter_alt')} />
               </Animated.View>
               <ThemedView bg="transparent" gap="md">
                  <Cascade delay={700}>
                     <ThemedText variant="h1" className="text-[32px] leading-[38px]">
                        {t('onboarding.done_title', { name: bikeName })}
                     </ThemedText>
                  </Cascade>
                  <Cascade delay={820}>
                     <ThemedText variant="body" color="secondary" className="leading-6">
                        {t('onboarding.done_body')}
                     </ThemedText>
                  </Cascade>
               </ThemedView>
            </Animated.View>
         ) : null}

         <FormFooter className="px-6 pt-4 pb-9">
            {step === 3 ? (
               <ThemedButton
                  title={t('onboarding.done_cta')}
                  size="lg"
                  fullWidth
                  onPress={finish}
               />
            ) : (
               <ThemedButton
                  title={
                     step === 2 ? t('onboarding.finish') : lang === 'mg' ? 'Tohizo' : 'Continuer'
                  }
                  size="lg"
                  fullWidth
                  onPress={next}
               />
            )}
         </FormFooter>
      </Screen>
   );
}

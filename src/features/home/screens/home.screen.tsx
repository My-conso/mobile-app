import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/src/components/layout/screen';
import { ScrollContainer } from '@/src/components/layout/scroll-container';
import { Row, ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedButton } from '@/src/components/ui/themed-button';
import { ThemedIcon } from '@/src/components/ui/themed-icon';
import { ThemedPressable } from '@/src/components/ui/themed-pressable';
import { Cascade } from '@/src/components/ui/themed-cascade';
import { AnimatedNumber } from '@/src/components/ui/themed-animated-number';
import { MotoHero } from '../components/moto-hero';
import { VehicleSwitcher } from '@/src/features/fuel/components/vehicle-switcher';
import { useOpenFuelForm } from '@/src/features/fuel/hooks';
import { useActiveVehicle, useConsumption, useFuelStore } from '@/src/features/fuel/store';
import { entryCost, MIN_SEGMENTS_FOR_ALERT } from '@/src/lib/consumption';
import { formatDayMonthName, formatNumber, monthKey } from '@/src/lib/format';
import type { RootStackParamList } from '@/src/navigation/types';

/** Below this gap (in %) the last fill-up counts as "same as usual". */
const STEADY_PERCENT = 0.5;

export function HomeScreen() {
   const { t } = useTranslation('fuel');
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
   const settings = useFuelStore(s => s.settings);
   const vehicle = useActiveVehicle();
   const result = useConsumption();
   const openFuelForm = useOpenFuelForm();

   const { summary, lastSegment, segments, sorted } = result;
   const lastEntry = sorted.length ? sorted[sorted.length - 1] : null;
   const currentMonth = monthKey(new Date().toISOString());
   const monthSpent = sorted.reduce(
      (sum, e) => (monthKey(e.date) === currentMonth ? sum + (entryCost(e) ?? 0) : sum),
      0
   );

   // How the last fill-up compares with the average: amber = a bit more, coral = over the alert threshold
   const delta =
      lastSegment && summary.l100 ? ((lastSegment.l100 - summary.l100) / summary.l100) * 100 : null;
   const overAlert =
      delta != null &&
      segments.length >= MIN_SEGMENTS_FOR_ALERT &&
      delta > settings.alertThresholdPercent;
   const trend =
      delta == null || Math.abs(delta) < STEADY_PERCENT
         ? null
         : overAlert
           ? { tone: 'danger' as const, icon: 'trend-up' as const, text: t('home.trend_alert') }
           : delta > 0
             ? { tone: 'accent' as const, icon: 'trend-up' as const, text: t('home.trend_up') }
             : {
                  tone: 'primary' as const,
                  icon: 'trend-down' as const,
                  text: t('home.trend_down'),
               };
   const deltaLabel =
      delta != null ? `${delta > 0 ? '+' : '−'}${formatNumber(Math.abs(delta), 1)} %` : '';

   return (
      <Screen
         safeAreaEdges={['top']}
         withSmallPadding={false}
         withDismissKeyboardOnOutside={false}
         withGradient={false}>
         <ScrollContainer contentContainerClassName="gap-3.5 px-5 pt-6 pb-6">
            {vehicle ? (
               <Cascade index={0}>
                  <Row items="start" justify="between" gap="md" bg="transparent">
                     <ThemedView bg="transparent" gap="xs" className="flex-1">
                        <ThemedText variant="caption" color="secondary" numberOfLines={1}>
                           {[vehicle.brand, vehicle.year].filter(Boolean).join(' · ')}
                        </ThemedText>
                        <ThemedText
                           variant="h1"
                           color="primary"
                           numberOfLines={2}
                           className="text-[40px] leading-[42px]">
                           {vehicle.model || vehicle.brand}
                        </ThemedText>
                     </ThemedView>
                     <ThemedPressable
                        accessibilityLabel={t('home.edit_vehicle')}
                        onPress={() =>
                           navigation.navigate('VehicleForm', { vehicleId: vehicle.id })
                        }
                        className="bg-card size-11 items-center justify-center rounded-lg">
                        <ThemedIcon name="pencil" size="sm" color="secondary" />
                     </ThemedPressable>
                  </Row>
               </Cascade>
            ) : (
               <ThemedText variant="h1" color="primary">
                  ToMo
               </ThemedText>
            )}
            <VehicleSwitcher />

            {!vehicle ? (
               <Cascade index={1}>
                  <ThemedView variant="card" rounded="hero" padding="lg" gap="md">
                     <ThemedText variant="h3">{t('home.welcome_title')}</ThemedText>
                     <ThemedText color="secondary">{t('home.welcome_text')}</ThemedText>
                     <ThemedButton
                        title={t('home.welcome_cta')}
                        size="lg"
                        fullWidth
                        onPress={() => navigation.navigate('VehicleForm')}
                     />
                  </ThemedView>
               </Cascade>
            ) : sorted.length === 0 ? (
               <>
                  <MotoHero
                     photoUri={vehicle.photoUri}
                     label={t('home.moto_alt')}
                     photoLabel={t('home.photo')}
                     onPhotoPress={() =>
                        navigation.navigate('VehicleForm', { vehicleId: vehicle.id })
                     }
                  />
                  <Cascade index={2}>
                     <ThemedView variant="card" rounded="hero" padding="lg" gap="md">
                        <ThemedText variant="h3">{t('home.empty_title')}</ThemedText>
                        <ThemedText color="secondary">{t('home.empty_text')}</ThemedText>
                        <ThemedButton
                           title={t('home.empty_cta')}
                           size="lg"
                           fullWidth
                           onPress={() => openFuelForm()}
                        />
                     </ThemedView>
                  </Cascade>
               </>
            ) : (
               <>
                  <MotoHero
                     photoUri={vehicle.photoUri}
                     label={t('home.moto_alt')}
                     photoLabel={t('home.photo')}
                     onPhotoPress={() =>
                        navigation.navigate('VehicleForm', { vehicleId: vehicle.id })
                     }
                  />

                  <Cascade index={2}>
                     <ThemedView variant="card" rounded="hero" gap="sm" className="p-[18px]">
                        <ThemedText variant="body-small" color="secondary">
                           {t('home.avg_title')}
                        </ThemedText>
                        {summary.l100 != null ? (
                           <>
                              <Row items="baseline" gap="xs" bg="transparent">
                                 <AnimatedNumber
                                    value={summary.l100}
                                    from={2}
                                    decimals={2}
                                    bounce
                                    weight="bold"
                                    className="text-[64px] leading-[68px]"
                                 />
                                 <ThemedText numeric weight="semibold" className="text-lg">
                                    {t('home.unit_l100')}
                                 </ThemedText>
                              </Row>
                              {summary.kmPerL != null ? (
                                 <ThemedText variant="body-small">
                                    {t('home.avg_per_litre', {
                                       km: formatNumber(summary.kmPerL, 0),
                                    })}
                                 </ThemedText>
                              ) : null}
                              {trend ? (
                                 <Row items="center" gap="sm" bg="transparent">
                                    <ThemedIcon
                                       name={trend.icon}
                                       size="xs"
                                       color={
                                          trend.tone === 'danger'
                                             ? 'danger'
                                             : trend.tone === 'accent'
                                               ? 'warning'
                                               : 'primary'
                                       }
                                       strokeWidth={2.4}
                                    />
                                    <ThemedText
                                       variant="caption"
                                       color={
                                          trend.tone === 'primary'
                                             ? 'primary'
                                             : trend.tone === 'danger'
                                               ? 'danger'
                                               : 'warning'
                                       }
                                       className="flex-1"
                                       accessibilityRole={overAlert ? 'alert' : undefined}>
                                       {trend.text} ({deltaLabel})
                                    </ThemedText>
                                 </Row>
                              ) : null}
                           </>
                        ) : (
                           <ThemedText color="secondary">{t('home.need_two_fulls')}</ThemedText>
                        )}
                     </ThemedView>
                  </Cascade>

                  <Cascade index={3}>
                     <Row gap="sm" bg="transparent">
                        <ThemedView
                           variant="card"
                           rounded="card"
                           gap="xs"
                           className="flex-1 px-4 py-3.5">
                           <ThemedText variant="caption" color="secondary">
                              {t('home.cost_per_100')}
                           </ThemedText>
                           {summary.costPer100Km != null ? (
                              <Row items="baseline" gap="xs" bg="transparent">
                                 <AnimatedNumber
                                    value={summary.costPer100Km}
                                    weight="bold"
                                    className="text-[30px] leading-9"
                                 />
                                 <ThemedText numeric weight="semibold" className="text-sm">
                                    {settings.currency}
                                 </ThemedText>
                              </Row>
                           ) : (
                              <ThemedText variant="h2">{t('common.dash')}</ThemedText>
                           )}
                        </ThemedView>
                        <ThemedView
                           variant="card"
                           rounded="card"
                           gap="xs"
                           className="flex-1 px-4 py-3.5">
                           <ThemedText variant="caption" color="secondary">
                              {t('home.month_label')}
                           </ThemedText>
                           <Row items="baseline" gap="xs" bg="transparent">
                              <AnimatedNumber
                                 value={monthSpent}
                                 weight="bold"
                                 className="text-[30px] leading-9"
                              />
                              <ThemedText numeric weight="semibold" className="text-sm">
                                 {settings.currency}
                              </ThemedText>
                           </Row>
                        </ThemedView>
                     </Row>
                  </Cascade>

                  {lastEntry ? (
                     <Cascade index={4}>
                        <ThemedView variant="card" rounded="card" gap="md" className="px-4 py-3.5">
                           <Row justify="between" items="center" bg="transparent">
                              <ThemedText
                                 variant="caption"
                                 color="secondary"
                                 className="flex-1"
                                 numberOfLines={1}>
                                 {t('home.last_title', {
                                    date: formatDayMonthName(lastEntry.date),
                                 })}
                              </ThemedText>
                              <ThemedPressable
                                 onPress={() => navigation.navigate('Tabs', { screen: 'History' })}
                                 className="min-h-11 justify-center">
                                 <ThemedText variant="body-small" weight="medium" color="primary">
                                    {t('home.see_all')}
                                 </ThemedText>
                              </ThemedPressable>
                           </Row>
                           <Row gap="sm" bg="transparent">
                              <ThemedView bg="transparent" gap="xs" className="flex-1">
                                 <Row items="baseline" gap="xs" bg="transparent">
                                    <AnimatedNumber
                                       value={lastEntry.liters}
                                       decimals={1}
                                       weight="bold"
                                       className="text-2xl leading-7"
                                    />
                                    <ThemedText numeric weight="semibold" className="text-[13px]">
                                       {t('home.unit_litres')}
                                    </ThemedText>
                                 </Row>
                                 <ThemedText variant="caption" color="secondary">
                                    {t('home.last_liters')}
                                 </ThemedText>
                              </ThemedView>
                              <ThemedView bg="transparent" gap="xs" className="flex-1">
                                 <Row items="baseline" gap="xs" bg="transparent">
                                    <AnimatedNumber
                                       value={lastEntry.odometerKm}
                                       weight="bold"
                                       className="text-2xl leading-7"
                                    />
                                    <ThemedText numeric weight="semibold" className="text-[13px]">
                                       {t('unit.km')}
                                    </ThemedText>
                                 </Row>
                                 <ThemedText variant="caption" color="secondary">
                                    {t('home.last_odometer')}
                                 </ThemedText>
                              </ThemedView>
                           </Row>
                        </ThemedView>
                     </Cascade>
                  ) : null}
               </>
            )}
         </ScrollContainer>
      </Screen>
   );
}

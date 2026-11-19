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
import { StatCard } from '@/src/components/ui/themed-stat-card';
import { AnimatedNumber } from '@/src/components/ui/themed-animated-number';
import { Odometer } from '@/src/components/ui/themed-odometer';
import { MiniBars } from '@/src/components/ui/themed-mini-bars';
import { VehicleAvatar } from '@/src/features/fuel/components/vehicle-avatar';
import { VehicleSwitcher } from '@/src/features/fuel/components/vehicle-switcher';
import { useOpenFuelForm } from '@/src/features/fuel/hooks';
import { useActiveVehicle, useConsumption, useFuelStore } from '@/src/features/fuel/store';
import { vehicleName } from '@/src/features/fuel/types';
import { estimatedRangeKm, MIN_SEGMENTS_FOR_ALERT } from '@/src/lib/consumption';
import { formatDateLong, formatKm, formatKmPerL, formatL100, formatNumber } from '@/src/lib/format';
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
   const range = estimatedRangeKm(summary.l100, vehicle?.tankCapacityLiters);
   const dash = t('common.dash');

   // How the last fill-up compares with the average: amber = a bit more, coral = over the alert threshold
   const delta = lastSegment && summary.l100 ? ((lastSegment.l100 - summary.l100) / summary.l100) * 100 : null;
   const overAlert = delta != null && segments.length >= MIN_SEGMENTS_FOR_ALERT && delta > settings.alertThresholdPercent;
   const trend =
      delta == null || Math.abs(delta) < STEADY_PERCENT
         ? null
         : overAlert
           ? { tone: 'danger' as const, icon: 'trend-up' as const, text: t('home.trend_alert') }
           : delta > 0
             ? { tone: 'accent' as const, icon: 'trend-up' as const, text: t('home.trend_up') }
             : { tone: 'primary' as const, icon: 'trend-down' as const, text: t('home.trend_down') };
   const deltaLabel = delta != null ? `${delta > 0 ? '+' : '−'}${formatNumber(Math.abs(delta), 1)} %` : '';

   const lastThree = segments.slice(-3).map(s => s.l100);

   return (
      <Screen safeAreaEdges={['top']} withSmallPadding={false} withDismissKeyboardOnOutside={false}>
         <ScrollContainer contentContainerClassName="gap-4 px-5 pt-7 pb-6">
            {vehicle ? (
               <Row items="center" gap="md" bg="transparent" className="min-h-11">
                  <VehicleAvatar vehicle={vehicle} size="md" />
                  <ThemedText variant="h2" numberOfLines={2} className="flex-1">
                     {vehicleName(vehicle)}
                  </ThemedText>
               </Row>
            ) : (
               <ThemedText variant="h2">ToMo</ThemedText>
            )}
            <VehicleSwitcher />

            {!vehicle ? (
               <ThemedView variant="card" rounded="card" padding="lg" gap="md">
                  <ThemedText variant="h3">{t('home.welcome_title')}</ThemedText>
                  <ThemedText color="secondary">{t('home.welcome_text')}</ThemedText>
                  <ThemedButton title={t('home.welcome_cta')} size="lg" fullWidth onPress={() => navigation.navigate('VehicleForm')} />
               </ThemedView>
            ) : sorted.length === 0 ? (
               <ThemedView variant="card" rounded="card" padding="lg" gap="md">
                  <ThemedText variant="h3">{t('home.empty_title')}</ThemedText>
                  <ThemedText color="secondary">{t('home.empty_text')}</ThemedText>
                  <ThemedButton title={t('home.empty_cta')} size="lg" fullWidth onPress={() => openFuelForm()} />
               </ThemedView>
            ) : (
               <>
                  <ThemedView variant="card" rounded="hero" gap="lg" className="p-[22px]">
                     <ThemedText variant="body-small" color="secondary">
                        {t('home.avg_title')}
                     </ThemedText>
                     {summary.l100 != null ? (
                        <>
                           <Row items="baseline" gap="sm" bg="transparent">
                              <AnimatedNumber value={summary.l100} decimals={2} weight="semibold" color="primary" className="text-6xl leading-none tracking-tighter" />
                              <ThemedText variant="body-large" color="secondary">
                                 {t('unit.l100')}
                              </ThemedText>
                           </Row>
                           <Row justify="between" items="end" gap="md" bg="transparent">
                              <ThemedView bg="transparent" gap="xs">
                                 <ThemedText numeric weight="medium" className="text-xl">
                                    {formatKmPerL(summary.kmPerL ?? 0)} {t('unit.kml')}
                                 </ThemedText>
                                 <ThemedText variant="caption" color="muted">
                                    {t('home.avg_detail', { count: summary.segmentCount, km: formatKm(summary.totalKm) })}
                                 </ThemedText>
                              </ThemedView>
                              <MiniBars values={lastThree} label={t('home.bars_label', { values: lastThree.map(formatL100).join(', ') })} />
                           </Row>
                           {trend ? (
                              <Row items="center" gap="sm" bg="transparent" className="border-border border-t pt-3.5">
                                 <ThemedIcon name={trend.icon} size="xs" color={trend.tone === 'danger' ? 'danger' : trend.tone === 'accent' ? 'warning' : 'primary'} strokeWidth={2.4} />
                                 <ThemedText variant="caption" color="secondary" className="flex-1" accessibilityRole={overAlert ? 'alert' : undefined}>
                                    {trend.text}{' '}
                                    <ThemedText variant="caption" weight="medium" color={trend.tone}>
                                       ({deltaLabel})
                                    </ThemedText>
                                 </ThemedText>
                              </Row>
                           ) : null}
                        </>
                     ) : (
                        <ThemedText color="secondary">{t('home.need_two_fulls')}</ThemedText>
                     )}
                  </ThemedView>

                  <Row gap="md" bg="transparent">
                     <StatCard
                        className="flex-1"
                        label={t('home.cost_per_100')}
                        value={summary.costPer100Km != null ? formatNumber(summary.costPer100Km, 0) : dash}
                        unit={summary.costPer100Km != null ? settings.currency : undefined}
                     />
                     <StatCard className="flex-1" label={t('home.km_tracked')} value={formatKm(summary.totalKm)} unit={t('unit.km')} />
                  </Row>
                  <Row gap="md" bg="transparent">
                     <StatCard className="flex-1" label={t('home.total_spent')} value={formatNumber(result.totalSpent, 0)} unit={settings.currency} />
                     {range != null ? (
                        <StatCard className="flex-1" label={t('home.range')} value={formatKm(range)} unit={t('unit.km')} />
                     ) : (
                        <ThemedPressable
                           onPress={() => navigation.navigate('VehicleForm', { vehicleId: vehicle.id, focus: 'tank' })}
                           className="border-border flex-1 gap-2.5 rounded-[18px] border border-dashed p-4">
                           <ThemedText variant="caption" color="secondary">
                              {t('home.range')}
                           </ThemedText>
                           <ThemedText variant="body-small" weight="medium" color="primary">
                              {t('home.range_missing')}
                           </ThemedText>
                        </ThemedPressable>
                     )}
                  </Row>

                  {lastEntry ? (
                     <ThemedView variant="card" rounded="card" gap="md" className="p-[18px]">
                        <Row justify="between" items="center" bg="transparent">
                           <ThemedText variant="body-small" color="secondary">
                              {t('home.last_entry')}
                           </ThemedText>
                           <ThemedText variant="body-small">{formatDateLong(lastEntry.date)}</ThemedText>
                        </Row>
                        <Row justify="between" items="center" bg="transparent">
                           <Odometer km={lastEntry.odometerKm} />
                           <ThemedText variant="body-small" color="secondary">
                              {t('home.last_entry_detail', { liters: formatNumber(lastEntry.liters, 1) })}
                           </ThemedText>
                        </Row>
                     </ThemedView>
                  ) : null}
               </>
            )}
         </ScrollContainer>
      </Screen>
   );
}

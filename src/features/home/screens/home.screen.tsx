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
import { AnimatedNumber } from '@/src/components/ui/themed-animated-number';
import { VehicleAvatar } from '@/src/features/fuel/components/vehicle-avatar';
import { VehicleSwitcher } from '@/src/features/fuel/components/vehicle-switcher';
import { useOpenFuelForm } from '@/src/features/fuel/hooks';
import { useActiveVehicle, useConsumption, useFuelStore } from '@/src/features/fuel/store';
import { vehicleName } from '@/src/features/fuel/types';
import { entryCost, MIN_SEGMENTS_FOR_ALERT } from '@/src/lib/consumption';
import { formatDateLong, formatKm, formatNumber, monthKey } from '@/src/lib/format';
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
   const dash = t('common.dash');
   const currentMonth = monthKey(new Date().toISOString());
   const monthSpent = sorted.reduce((sum, e) => (monthKey(e.date) === currentMonth ? sum + (entryCost(e) ?? 0) : sum), 0);

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
               <ThemedView variant="card" border="default" rounded="2xl" padding="lg" gap="md">
                  <ThemedText variant="h3">{t('home.welcome_title')}</ThemedText>
                  <ThemedText color="secondary">{t('home.welcome_text')}</ThemedText>
                  <ThemedButton title={t('home.welcome_cta')} size="lg" fullWidth onPress={() => navigation.navigate('VehicleForm')} />
               </ThemedView>
            ) : sorted.length === 0 ? (
               <ThemedView variant="card" border="default" rounded="2xl" padding="lg" gap="md">
                  <ThemedText variant="h3">{t('home.empty_title')}</ThemedText>
                  <ThemedText color="secondary">{t('home.empty_text')}</ThemedText>
                  <ThemedButton title={t('home.empty_cta')} size="lg" fullWidth onPress={() => openFuelForm()} />
               </ThemedView>
            ) : (
               <>
                  <ThemedView variant="card" border="default" rounded="2xl" gap="lg" className="p-[22px]">
                     <ThemedText variant="body-small" color="secondary">
                        {t('home.avg_title')}
                     </ThemedText>
                     {summary.l100 != null ? (
                        <>
                           <Row items="baseline" gap="sm" bg="transparent">
                              <AnimatedNumber value={summary.l100} decimals={2} weight="semibold" color="primary" className="text-6xl leading-none tracking-tighter" />
                              <ThemedText variant="body-large" color="secondary">
                                 {t('home.avg_unit')}
                              </ThemedText>
                           </Row>
                           {summary.kmPerL != null ? (
                              <ThemedText variant="body-small">{t('home.avg_per_litre', { km: formatNumber(summary.kmPerL, 0) })}</ThemedText>
                           ) : null}
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

                  <ThemedView variant="card" border="default" rounded="2xl" gap="md" className="p-5">
                     <ThemedText variant="body-small" color="secondary">
                        {t('home.cost_title')}
                     </ThemedText>
                     <Row items="baseline" gap="sm" bg="transparent">
                        <ThemedText numeric weight="semibold" variant="h2">
                           {summary.costPer100Km != null ? `${formatNumber(summary.costPer100Km, 0)} ${settings.currency}` : dash}
                        </ThemedText>
                        <ThemedText variant="caption" color="secondary">
                           {t('home.cost_unit')}
                        </ThemedText>
                     </Row>
                     {monthSpent > 0 ? (
                        <ThemedText variant="caption" color="secondary">
                           {t('home.month_spent', { amount: `${formatNumber(monthSpent, 0)} ${settings.currency}` })}
                        </ThemedText>
                     ) : null}
                  </ThemedView>

                  {lastEntry ? (
                     <ThemedView variant="card" border="default" rounded="2xl" className="px-5 py-1.5">
                        <ThemedText variant="body-small" color="secondary" className="pt-3 pb-1.5">
                           {t('home.last_entry')}
                        </ThemedText>
                        <Row justify="between" items="center" bg="transparent" className="min-h-10">
                           <ThemedText variant="body-small" color="secondary">
                              {t('home.last_date')}
                           </ThemedText>
                           <ThemedText variant="body-small">{formatDateLong(lastEntry.date)}</ThemedText>
                        </Row>
                        <Row justify="between" items="center" bg="transparent" className="border-border min-h-10 border-t">
                           <ThemedText variant="body-small" color="secondary">
                              {t('home.last_liters')}
                           </ThemedText>
                           <ThemedText variant="body-small" numeric weight="medium">
                              {t('home.liters_value', { liters: formatNumber(lastEntry.liters, 1) })}
                           </ThemedText>
                        </Row>
                        <Row justify="between" items="center" bg="transparent" className="border-border min-h-10 border-t">
                           <ThemedText variant="body-small" color="secondary">
                              {t('home.last_odometer')}
                           </ThemedText>
                           <ThemedText variant="body-small" numeric weight="medium">
                              {formatKm(lastEntry.odometerKm)} {t('unit.km')}
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

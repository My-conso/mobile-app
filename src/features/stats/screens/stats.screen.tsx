import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/src/components/layout/screen';
import { ScrollContainer } from '@/src/components/layout/scroll-container';
import { Row, ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { SegmentedControl } from '@/src/components/ui/themed-segmented-control';
import { BarChart } from '@/src/components/ui/themed-bar-chart';
import { RowGroup } from '@/src/components/ui/themed-row-group';
import { VehicleSwitcher } from '@/src/features/fuel/components/vehicle-switcher';
import { useConsumption, useFuelStore, useVehicleEntries } from '@/src/features/fuel/store';
import { entryCost, filterSegmentsByPeriod, periodStart, summarize, type Period, type Segment } from '@/src/lib/consumption';
import { formatDate, formatDayMonth, formatDayMonthName, formatKm, formatL100, formatLiters, formatNumber } from '@/src/lib/format';

/** Beyond this many fill-ups the bars get too thin to read: keep the latest ones. */
const MAX_BARS = 10;

function TableRow({ label, value }: { label: string; value: string }) {
   return (
      <Row justify="between" items="center" gap="md" bg="transparent" className="min-h-12 px-4 py-3">
         <ThemedText variant="body-small" color="secondary" className="flex-1">
            {label}
         </ThemedText>
         <ThemedText numeric weight="medium" variant="body-small">
            {value}
         </ThemedText>
      </Row>
   );
}

export function StatsScreen() {
   const { t } = useTranslation('fuel');
   const [period, setPeriod] = useState<Period>('all');
   const entries = useVehicleEntries();
   const currency = useFuelStore(s => s.settings.currency);
   const { segments } = useConsumption();

   const filtered = useMemo(() => filterSegmentsByPeriod(segments, period), [segments, period]);
   const summary = useMemo(() => summarize(filtered), [filtered]);

   const best = useMemo(() => filtered.reduce<Segment | null>((b, s) => (!b || s.l100 < b.l100 ? s : b), null), [filtered]);
   const worst = useMemo(() => filtered.reduce<Segment | null>((w, s) => (!w || s.l100 > w.l100 ? s : w), null), [filtered]);

   const spent = useMemo(() => {
      const start = periodStart(period);
      return entries.filter(e => !start || Date.parse(e.date) >= start.getTime()).reduce((sum, e) => sum + (entryCost(e) ?? 0), 0);
   }, [entries, period]);

   const bars = filtered.slice(-MAX_BARS);
   const items = bars.map(s => ({ label: bars.length <= 5 ? formatDayMonthName(s.date) : formatDayMonth(s.date), value: s.l100 }));

   const periods: { value: Period; label: string }[] = [
      { value: '3m', label: t('stats.p3m') },
      { value: '6m', label: t('stats.p6m') },
      { value: '1y', label: t('stats.p1y') },
      { value: 'all', label: t('stats.pall') },
   ];

   const dash = t('common.dash');
   const caption = (s: Segment | null) => (s ? formatDate(s.date) : '');

   return (
      <Screen safeAreaEdges={['top']} withSmallPadding={false} withDismissKeyboardOnOutside={false}>
         <ScrollContainer contentContainerClassName="gap-4 px-5 pt-7 pb-6">
            <ThemedText variant="h2">{t('stats.title')}</ThemedText>
            <VehicleSwitcher />
            <SegmentedControl options={periods} value={period} onChange={setPeriod} />

            <ThemedView variant="card" rounded="hero" gap="md" className="p-5">
               <Row justify="between" items="center" gap="md" bg="transparent">
                  <ThemedText variant="body-small" color="secondary">
                     {t('stats.chart_title')}
                  </ThemedText>
                  {summary.l100 != null ? (
                     <Row items="center" gap="sm" bg="transparent">
                        <ThemedView className="border-foreground-muted w-4 border-t-2 border-dashed" />
                        <ThemedText variant="caption" color="secondary">
                           {t('stats.chart_average', { value: formatL100(summary.l100) })}
                        </ThemedText>
                     </Row>
                  ) : null}
               </Row>
               {items.length > 0 ? (
                  <BarChart
                     items={items}
                     average={summary.l100}
                     format={formatL100}
                     label={t('stats.chart_aria', { values: items.map(i => `${i.label} ${formatL100(i.value)}`).join(', '), avg: summary.l100 != null ? formatL100(summary.l100) : dash })}
                  />
               ) : (
                  <ThemedText color="secondary" className="py-6">
                     {t('stats.chart_empty')}
                  </ThemedText>
               )}
            </ThemedView>

            <Row gap="md" bg="transparent">
               <ThemedView variant="card" rounded="card" gap="sm" className="flex-1 p-4">
                  <ThemedText variant="caption" color="secondary">
                     {t('stats.best')}
                  </ThemedText>
                  <ThemedText numeric weight="semibold" color="primary" className="text-[22px]">
                     {best ? formatL100(best.l100) : dash}
                  </ThemedText>
                  <ThemedText variant="caption" color="muted">
                     {caption(best)}
                  </ThemedText>
               </ThemedView>
               <ThemedView variant="card" rounded="card" gap="sm" className="flex-1 p-4">
                  <ThemedText variant="caption" color="secondary">
                     {t('stats.worst')}
                  </ThemedText>
                  <ThemedText numeric weight="semibold" className="text-[22px]">
                     {worst ? formatL100(worst.l100) : dash}
                  </ThemedText>
                  <ThemedText variant="caption" color="muted">
                     {caption(worst)}
                  </ThemedText>
               </ThemedView>
            </Row>

            <RowGroup>
               <TableRow label={t('stats.distance')} value={`${formatKm(summary.totalKm)} ${t('unit.km')}`} />
               <TableRow label={t('stats.fuel')} value={`${formatLiters(summary.totalLiters)} ${t('unit.l')}`} />
               <TableRow label={t('stats.spent')} value={`${formatNumber(spent, 0)} ${currency}`} />
            </RowGroup>
         </ScrollContainer>
      </Screen>
   );
}

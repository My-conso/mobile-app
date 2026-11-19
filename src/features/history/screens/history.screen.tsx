import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/src/components/layout/screen';
import { Row, ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedIcon } from '@/src/components/ui/themed-icon';
import { ThemedList } from '@/src/components/ui/themed-list';
import { ThemedPressable } from '@/src/components/ui/themed-pressable';
import { Status, type StatusTone } from '@/src/components/ui/themed-status';
import { VehicleSwitcher } from '@/src/features/fuel/components/vehicle-switcher';
import { useOpenFuelForm } from '@/src/features/fuel/hooks';
import { useConsumption, useFuelStore, useVehicleEntries } from '@/src/features/fuel/store';
import { entryCost, type ConsumptionResult } from '@/src/lib/consumption';
import {
   formatDayMonthName,
   formatKm,
   formatL100,
   formatLiters,
   formatMonthShort,
   formatMonthYear,
   formatNumber,
   monthKey,
} from '@/src/lib/format';
import type { FuelEntry } from '@/src/features/fuel/types';
import { cn } from '@/src/utils/tailwind';

/** The list is flat (FlashList has no sections): month headers, fill-ups and a closing note are typed rows. */
type HistoryRow =
   | { type: 'header'; key: string; title: string; liters: number; cost: number }
   | { type: 'entry'; key: string; entry: FuelEntry; first: boolean; last: boolean }
   | { type: 'note'; key: string };

interface RowProps {
   item: HistoryRow;
   info: ConsumptionResult['info'];
   bestEntryId?: string;
   currency: string;
   onOpen: (entryId: string) => void;
}

const BADGE: Record<string, { key: string; tone: StatusTone }> = {
   pending: { key: 'history.badge_pending', tone: 'attention' },
   partial: { key: 'history.badge_partial', tone: 'attention' },
   reference: { key: 'history.badge_reference', tone: 'neutral' },
   broken: { key: 'history.badge_broken', tone: 'muted' },
   invalid: { key: 'history.badge_invalid', tone: 'danger' },
   ignored: { key: 'history.badge_ignored', tone: 'muted' },
};

/** One list row. Memoised so recycled cells only re-render when their own data changes. */
const HistoryListRow = memo(function HistoryListRow({ item, info, bestEntryId, currency, onOpen }: RowProps) {
   const { t } = useTranslation('fuel');

   if (item.type === 'header') {
      return (
         <Row justify="between" items="baseline" bg="transparent" className="pt-5 pb-2">
            <ThemedText weight="medium" transform="capitalize">
               {item.title}
            </ThemedText>
            <ThemedText variant="caption" color="secondary">
               {t('history.month_total', { liters: formatLiters(item.liters), cost: `${formatNumber(item.cost, 0)} ${currency}` })}
            </ThemedText>
         </Row>
      );
   }

   if (item.type === 'note') {
      return (
         <Row gap="sm" items="start" bg="transparent" rounded="lg" className="border-border mt-4 border border-dashed p-3.5">
            <ThemedIcon name="info" size="sm" color="secondary" />
            <ThemedText variant="caption" color="secondary" className="flex-1 leading-5">
               {t('history.note')}
            </ThemedText>
         </Row>
      );
   }

   const { entry } = item;
   const i = info[entry.id];
   const role = i?.role;
   const cost = entryCost(entry);
   const liters = formatLiters(entry.liters);
   const amount = cost != null ? `${t('history.row_detail', { liters })} · ${formatNumber(cost, 0)} ${currency}` : t('history.row_detail', { liters });
   const situation =
      role === 'broken'
         ? t('history.detail_broken')
         : role === 'partial' && i.segment
           ? t('history.detail_partial', { date: formatDayMonthName(i.segment.date) })
           : role === 'pending'
             ? t('history.detail_pending')
             : null;
   const badge = role && role !== 'segment' ? BADGE[role] : undefined;
   const day = String(new Date(entry.date).getDate()).padStart(2, '0');

   return (
      <ThemedPressable
         onPress={() => onOpen(entry.id)}
         className={cn(
            'bg-card border-border min-h-16 flex-row items-center gap-3.5 border-x border-t px-4 py-3.5',
            item.first && 'rounded-t-card',
            item.last && 'rounded-b-card border-b',
         )}>
         <ThemedView bg="background-secondary" className="border-border-subtle w-14 items-center justify-center rounded-2xl border px-1 py-2">
            <ThemedText variant="caption" color="secondary" weight="medium" className="text-[10px] leading-4 uppercase">
               {formatMonthShort(entry.date).replace('.', '')}
            </ThemedText>
            <ThemedText numeric weight="semibold" className="text-xl leading-6">
               {day}
            </ThemedText>
         </ThemedView>
         <ThemedView bg="transparent" gap="xs" className="min-w-0 flex-1">
            <ThemedText variant="body">{formatKm(entry.odometerKm)} km</ThemedText>
            <ThemedText variant="caption" color="muted" numberOfLines={1}>
               {amount}
            </ThemedText>
            {situation ? (
               <ThemedText variant="caption" color="secondary" numberOfLines={1}>
                  {situation}
               </ThemedText>
            ) : null}
         </ThemedView>
         {role === 'segment' && i.segment ? (
            <ThemedView bg="transparent" className="items-end gap-0.5">
               <ThemedText numeric weight="semibold" color={entry.id === bestEntryId ? 'primary' : 'default'} className="text-lg">
                  {formatL100(i.segment.l100)}
               </ThemedText>
               <ThemedText variant="caption" color="muted" className="text-[11px]">
                  {t('unit.l100')}
               </ThemedText>
            </ThemedView>
         ) : badge ? (
            <Status label={t(badge.key as 'history.badge_pending')} tone={badge.tone} />
         ) : null}
      </ThemedPressable>
   );
});

const getRowKey = (row: HistoryRow) => row.key;
const getRowType = (row: HistoryRow) => row.type;

export function HistoryScreen() {
   const { t } = useTranslation('fuel');
   const openFuelForm = useOpenFuelForm();
   const entries = useVehicleEntries();
   const currency = useFuelStore(s => s.settings.currency);
   const { info, bestSegment } = useConsumption();

   const rows = useMemo<HistoryRow[]>(() => {
      const sorted = [...entries].sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.odometerKm - a.odometerKm);
      const out: HistoryRow[] = [];
      let header: Extract<HistoryRow, { type: 'header' }> | null = null;
      let lastEntryRow: Extract<HistoryRow, { type: 'entry' }> | null = null;
      for (const e of sorted) {
         const key = monthKey(e.date);
         if (!header || header.key !== `h-${key}`) {
            if (lastEntryRow) lastEntryRow.last = true;
            header = { type: 'header', key: `h-${key}`, title: formatMonthYear(e.date), liters: 0, cost: 0 };
            out.push(header);
            lastEntryRow = null;
         }
         header.liters += e.liters;
         header.cost += entryCost(e) ?? 0;
         const row: Extract<HistoryRow, { type: 'entry' }> = { type: 'entry', key: e.id, entry: e, first: lastEntryRow === null, last: false };
         out.push(row);
         lastEntryRow = row;
      }
      if (lastEntryRow) lastEntryRow.last = true;
      if (out.length) out.push({ type: 'note', key: 'note' });
      return out;
   }, [entries]);

   const bestEntryId = bestSegment?.entryId;
   const renderRow = useCallback(
      ({ item }: { item: HistoryRow }) => (
         <HistoryListRow item={item} info={info} bestEntryId={bestEntryId} currency={currency} onOpen={openFuelForm} />
      ),
      [info, bestEntryId, currency, openFuelForm],
   );

   return (
      <Screen safeAreaEdges={['top']} withSmallPadding={false} withDismissKeyboardOnOutside={false}>
         <ThemedView bg="transparent" gap="md" className="px-5 pt-7 pb-1">
            <ThemedText variant="h2">{t('history.title')}</ThemedText>
            <VehicleSwitcher />
         </ThemedView>
         <ThemedList
            data={rows}
            renderItem={renderRow}
            keyExtractor={getRowKey}
            getItemType={getRowType}
            drawDistance={500}
            contentContainerClassName="px-5 pb-6"
            ListEmptyComponent={
               <ThemedText color="secondary" className="pt-8 text-center">
                  {t('history.empty')}
               </ThemedText>
            }
         />
      </Screen>
   );
}

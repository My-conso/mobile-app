import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import Animated, { FadeIn, ReduceMotion, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/src/components/layout/screen';
import { ScreenHeader } from '@/src/components/layout/screen-header';
import { ScrollContainer } from '@/src/components/layout/scroll-container';
import { Row, ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedInput } from '@/src/components/ui/themed-input';
import { ThemedButton } from '@/src/components/ui/themed-button';
import { ThemedIcon } from '@/src/components/ui/themed-icon';
import { ThemedPressable } from '@/src/components/ui/themed-pressable';
import { RowGroup } from '@/src/components/ui/themed-row-group';
import { DateTimeField } from '@/src/components/ui/themed-date-time-field';
import { SwitchRow } from '@/src/components/ui/themed-switch-row';
import { VehicleAvatar } from '@/src/features/fuel/components/vehicle-avatar';
import { useActiveVehicle, useConsumption, useFuelStore } from '@/src/features/fuel/store';
import type { Vehicle } from '@/src/features/fuel/types';
import { previewEntry, sortEntries } from '@/src/lib/consumption';
import { formatKm, formatL100, formatNumber, parseDecimal } from '@/src/lib/format';
import { round2, validateDraft, type FormDraft } from '@/src/lib/validation';
import type { RootStackParamList } from '@/src/navigation/types';

type PriceMode = 'per_liter' | 'total';

/** Empty string → null, unparsable → 0 (so validation flags it), otherwise the number. */
function numOrNull(text: string): number | null {
   if (text.trim() === '') return null;
   return parseDecimal(text) ?? 0;
}

const plain = (n: number, d: number) => formatNumber(n, d).replace(/ /g, '');

/** No vehicle yet → there is nothing to attach a fill-up to: go add one first. */
function RedirectToVehicleForm() {
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
   useEffect(() => {
      navigation.replace('VehicleForm');
   }, [navigation]);
   return null;
}

export function FuelFormScreen() {
   const activeVehicle = useActiveVehicle();
   return activeVehicle ? <FuelFormInner activeVehicle={activeVehicle} /> : <RedirectToVehicleForm />;
}

function FuelFormInner({ activeVehicle }: { activeVehicle: Vehicle }) {
   const { t } = useTranslation('fuel');
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
   const route = useRoute<RouteProp<RootStackParamList, 'FuelForm'>>();
   const entryId = route.params?.entryId;

   const allEntries = useFuelStore(s => s.entries);
   const vehicles = useFuelStore(s => s.vehicles);
   const settings = useFuelStore(s => s.settings);
   const addEntry = useFuelStore(s => s.addEntry);
   const updateEntry = useFuelStore(s => s.updateEntry);
   const deleteEntry = useFuelStore(s => s.deleteEntry);

   // Always return to the screen the user came from (Home or History); fall back to Home if the form was opened first.
   const goBack = () => {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
   };

   const existing = useMemo(() => allEntries.find(e => e.id === entryId), [allEntries, entryId]);
   // Editing keeps the entry's own vehicle; a new fill-up goes to the active vehicle
   const vehicle = (existing && vehicles.find(v => v.id === existing.vehicleId)) || activeVehicle;
   const entries = useMemo(() => allEntries.filter(e => e.vehicleId === vehicle.id), [allEntries, vehicle.id]);
   const isEdit = !!existing;

   const [date, setDate] = useState(() => (existing ? new Date(existing.date) : new Date()));
   const [odometer, setOdometer] = useState(existing ? plain(existing.odometerKm, 0) : '');
   const [liters, setLiters] = useState(existing ? plain(existing.liters, 2).replace(/,00$/, '') : '');
   // An imported entry may only have a total: open it in "total" mode so nothing is lost on save
   const [priceMode, setPriceMode] = useState<PriceMode>(existing && !existing.pricePerLiter && existing.totalCost ? 'total' : 'per_liter');
   const [priceText, setPriceText] = useState(
      existing?.pricePerLiter
         ? plain(existing.pricePerLiter, 2).replace(/,00$/, '')
         : existing?.totalCost
           ? plain(existing.totalCost, 0)
           : '',
   );
   const [isFullTank, setIsFullTank] = useState(existing?.isFullTank ?? true);
   const [missedPrevious, setMissedPrevious] = useState(existing?.missedPrevious ?? false);
   const [submitted, setSubmitted] = useState(false);
   /** Id of the entry just saved: shows the "C'est noté !" screen */
   const [savedId, setSavedId] = useState<string | null>(null);

   const lastKnownKm = useMemo(() => {
      const others = sortEntries(entries.filter(e => e.id !== entryId));
      return others.length ? others[others.length - 1].odometerKm : null;
   }, [entries, entryId]);

   // Resolve the two price values from whichever one the user typed
   const litersNum = numOrNull(liters);
   const priceNum = numOrNull(priceText);
   const resolved = useMemo(() => {
      if (priceNum == null) return { pricePerLiter: null, totalCost: null };
      if (priceMode === 'per_liter') {
         return { pricePerLiter: priceNum, totalCost: litersNum && litersNum > 0 && priceNum > 0 ? priceNum * litersNum : null };
      }
      return { pricePerLiter: litersNum && litersNum > 0 && priceNum > 0 ? priceNum / litersNum : null, totalCost: priceNum };
   }, [priceNum, priceMode, litersNum]);

   const draft: FormDraft = {
      date: date.toISOString(),
      odometerKm: numOrNull(odometer),
      liters: litersNum,
      // keep the raw invalid value (0) so validation can flag it
      pricePerLiter: priceMode === 'per_liter' ? priceNum : resolved.pricePerLiter,
      totalCost: priceMode === 'total' ? priceNum : resolved.totalCost,
      isFullTank,
      missedPrevious,
   };

   const validation = useMemo(
      () => validateDraft(draft, entries, vehicle, entryId),
      // eslint-disable-next-line react-hooks/exhaustive-deps -- draft is rebuilt each render from the state below
      [date, odometer, liters, priceText, priceMode, isFullTank, missedPrevious, entries, vehicle, entryId],
   );

   const preview = useMemo(() => {
      if (draft.odometerKm == null || draft.liters == null || !(draft.odometerKm > 0) || !(draft.liters > 0)) return null;
      return previewEntry(
         entries,
         {
            id: '__draft__',
            date: draft.date,
            odometerKm: draft.odometerKm,
            liters: draft.liters,
            isFullTank,
            missedPrevious,
            pricePerLiter: draft.pricePerLiter ?? undefined,
            totalCost: draft.totalCost ?? undefined,
         },
         entryId,
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
   }, [date, odometer, liters, priceText, priceMode, isFullTank, missedPrevious, entries, entryId]);

   const fieldError = (e?: { code: string; params?: Record<string, string | number> }) =>
      submitted && e
         ? t(`form.err_${e.code}` as 'form.err_odometer_required', {
              km: e.params?.km != null ? formatKm(Number(e.params.km)) : '',
           })
         : undefined;

   const warningText = (w: { code: string; params?: Record<string, number> }) =>
      t(`form.warn_${w.code}` as 'form.warn_liters_over_tank', {
         tank: w.params?.tank != null ? formatNumber(w.params.tank, 1) : '',
         km: w.params?.km != null ? formatKm(w.params.km) : '',
         l100: w.params?.l100 != null ? formatL100(w.params.l100) : '',
      });

   const persist = () => {
      const input = {
         vehicleId: vehicle.id,
         date: date.toISOString(),
         odometerKm: draft.odometerKm as number,
         liters: round2(draft.liters as number),
         pricePerLiter: resolved.pricePerLiter ?? undefined,
         totalCost: resolved.totalCost ?? undefined,
         isFullTank,
         missedPrevious,
         // not shown in the form anymore, but never lost when editing an older entry
         station: existing?.station,
         note: existing?.note,
      };
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isEdit && entryId) {
         updateEntry(entryId, input);
         setSavedId(entryId);
      } else {
         setSavedId(addEntry(input).id);
      }
   };

   const onSave = () => {
      setSubmitted(true);
      if (validation.hasErrors) return;
      if (validation.warnings.length > 0) {
         Alert.alert(t('form.warning_title'), validation.warnings.map(warningText).join('\n\n'), [
            { text: t('form.warning_back'), style: 'cancel' },
            { text: t('form.warning_confirm'), onPress: persist },
         ]);
         return;
      }
      persist();
   };

   const onDelete = () =>
      Alert.alert(t('form.delete_title'), t('form.delete_text'), [
         { text: t('common.cancel'), style: 'cancel' },
         {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => {
               if (entryId) deleteEntry(entryId);
               goBack();
            },
         },
      ]);

   const switchPriceMode = () => {
      setPriceMode(m => (m === 'per_liter' ? 'total' : 'per_liter'));
      setPriceText('');
   };

   // What the live calculation says about this fill-up
   const role = preview?.info.role;
   const segment = preview?.info.segment;
   const showCalc = !!preview && role === 'segment' && !!segment;
   const infoText = !preview
      ? t('form.info_none')
      : role === 'broken'
        ? t('form.info_missed')
        : role === 'pending' || role === 'partial'
          ? t('form.info_partial')
          : role === 'invalid'
            ? t('form.info_invalid')
            : role === 'reference'
              ? t('form.info_reference')
              : null;

   const computed =
      priceMode === 'per_liter'
         ? resolved.totalCost != null && resolved.totalCost > 0
            ? t('form.total_value', { value: `${formatNumber(resolved.totalCost, 0)} ${settings.currency}` })
            : null
         : resolved.pricePerLiter != null && resolved.pricePerLiter > 0
           ? t('form.per_liter_value', { value: `${formatNumber(resolved.pricePerLiter, 0)} ${settings.currency}` })
           : null;

   if (savedId) {
      return <SavedConfirmation entryId={savedId} onDone={goBack} />;
   }

   return (
      <Screen withKeyboardAvoiding withSmallPadding={false}>
         <ScreenHeader
            title={isEdit ? t('form.title_edit') : t('form.title_new')}
            onBack={goBack}
            backLabel={t('common.back')}
            right={vehicles.length > 1 ? <VehicleAvatar vehicle={vehicle} size="md" /> : undefined}
         />

         <ScrollContainer contentContainerClassName="gap-3.5 px-5 pt-3 pb-4" keyboardShouldPersistTaps="handled">
            <DateTimeField label={t('form.date')} value={date} onChange={setDate} />

            <ThemedInput
               label={t('form.odometer')}
               value={odometer}
               onChangeText={setOdometer}
               keyboardType="number-pad"
               size="lg"
               numeric
               suffix={t('unit.km')}
               error={fieldError(validation.errors.odometerKm)}
               helperText={lastKnownKm != null ? t('form.odometer_last', { km: formatKm(lastKnownKm) }) : t('form.odometer_help')}
            />

            <Row gap="md" bg="transparent" items="start">
               <ThemedView bg="transparent" className="flex-1">
                  <ThemedInput
                     label={t('form.liters')}
                     value={liters}
                     onChangeText={setLiters}
                     keyboardType="decimal-pad"
                     numeric
                     suffix={t('unit.l')}
                     error={fieldError(validation.errors.liters)}
                  />
               </ThemedView>
               <ThemedView bg="transparent" className="flex-1">
                  <ThemedInput
                     label={priceMode === 'per_liter' ? t('form.price_per_liter') : t('form.price_total')}
                     value={priceText}
                     onChangeText={setPriceText}
                     keyboardType="decimal-pad"
                     numeric
                     suffix={settings.currency}
                     error={fieldError(validation.errors.price)}
                  />
               </ThemedView>
            </Row>
            <Row justify="between" items="center" gap="md" bg="transparent" className="-mt-1">
               <ThemedPressable onPress={switchPriceMode} className="min-h-11 justify-center">
                  <ThemedText variant="caption" weight="medium" color="primary">
                     {priceMode === 'per_liter' ? t('form.to_total') : t('form.to_per_liter')}
                  </ThemedText>
               </ThemedPressable>
               {computed ? (
                  <ThemedText variant="caption" color="secondary">
                     {computed}
                  </ThemedText>
               ) : null}
            </Row>

            <RowGroup>
               <SwitchRow label={t('form.full_tank')} help={t('form.full_tank_help')} value={isFullTank} onValueChange={setIsFullTank} />
               <SwitchRow label={t('form.missed')} value={missedPrevious} onValueChange={setMissedPrevious} />
            </RowGroup>

            {showCalc && segment ? (
               <Row items="center" justify="between" gap="md" bg="transparent" rounded="lg" className="bg-primary-soft p-4">
                  <ThemedView bg="transparent" gap="xs" className="flex-1">
                     <ThemedText variant="caption" color="primary">
                        {t('form.calc_title')}
                     </ThemedText>
                     <ThemedText variant="body-small">{t('form.calc_distance', { km: formatKm(segment.distanceKm) })}</ThemedText>
                  </ThemedView>
                  <Row items="baseline" gap="xs" bg="transparent">
                     <ThemedText numeric weight="semibold" color="primary" className="text-[22px]">
                        {formatL100(segment.l100)}
                     </ThemedText>
                     <ThemedText variant="caption" weight="medium" color="primary">
                        L/100
                     </ThemedText>
                  </Row>
               </Row>
            ) : infoText ? (
               <Row gap="sm" items="start" bg="transparent" rounded="lg" className="border-border border border-dashed p-4">
                  <ThemedIcon name="info" size="sm" color="warning" />
                  <ThemedText variant="caption" color="secondary" className="flex-1 leading-5">
                     {infoText}
                  </ThemedText>
               </Row>
            ) : null}

            {isEdit ? (
               <ThemedButton title={t('common.delete')} variant="outline" size="md" fullWidth textClassName="text-danger" onPress={onDelete} />
            ) : null}
         </ScrollContainer>

         <ThemedView bg="transparent" className="px-5 pt-2 pb-7">
            <ThemedButton title={t('form.save')} size="lg" fullWidth onPress={onSave} />
         </ThemedView>
      </Screen>
   );
}

/** "C'est noté !": shown after saving, with the result of the calculation. */
function SavedConfirmation({ entryId, onDone }: { entryId: string; onDone: () => void }) {
   const { t } = useTranslation('fuel');
   const result = useConsumption();
   const segment = result.info[entryId]?.segment;
   const average = result.summary.l100;
   const body =
      segment && average != null && result.info[entryId]?.role === 'segment'
         ? t('form.saved_body', { l100: formatL100(segment.l100), km: formatKm(segment.distanceKm), avg: formatL100(average) })
         : t('form.saved_plain');

   return (
      <Screen withSmallPadding={false}>
         <Animated.View entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)} className="flex-1 items-center justify-center gap-5 px-8">
            <Animated.View entering={ZoomIn.duration(420).reduceMotion(ReduceMotion.System)}>
               <ThemedView className="bg-primary size-22 items-center justify-center rounded-full">
                  <ThemedIcon name="check" customSize={44} color="inverse" strokeWidth={2.6} />
               </ThemedView>
            </Animated.View>
            <ThemedView bg="transparent" gap="sm" className="items-center">
               <ThemedText variant="h2">{t('form.saved_title')}</ThemedText>
               <ThemedText color="secondary" align="center" className="leading-6">
                  {body}
               </ThemedText>
            </ThemedView>
            <ThemedButton title={t('form.back_home')} variant="outline" size="md" onPress={onDone} />
         </Animated.View>
      </Screen>
   );
}

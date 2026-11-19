import React, { useState } from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/src/components/layout/screen';
import { ScreenHeader } from '@/src/components/layout/screen-header';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedInput } from '@/src/components/ui/themed-input';
import { ThemedButton } from '@/src/components/ui/themed-button';
import { useFuelStore } from '@/src/features/fuel/store';
import { DEFAULT_SETTINGS } from '@/src/features/fuel/types';
import { formatInput, formatNumber, parseDecimal } from '@/src/lib/format';
import type { RootStackParamList } from '@/src/navigation/types';
import { useGoBack } from '@/src/navigation/use-go-back';

/** Edits one app-wide preference (currency symbol or alert threshold) on its own small screen. */
export function SettingEditScreen() {
   const { t } = useTranslation('fuel');
   const { kind } = useRoute<RouteProp<RootStackParamList, 'SettingEdit'>>().params;
   const settings = useFuelStore(s => s.settings);
   const updateSettings = useFuelStore(s => s.updateSettings);

   const isCurrency = kind === 'currency';
   const isPrice = kind === 'price';
   const [value, setValue] = useState(
      isCurrency
         ? settings.currency
         : isPrice
           ? settings.fuelPricePerLiter != null
              ? formatNumber(settings.fuelPricePerLiter, 2).replace(/,00$/, '')
              : ''
           : formatNumber(settings.alertThresholdPercent, 0)
   );
   const [submitted, setSubmitted] = useState(false);

   const goBack = useGoBack();

   const parsed = parseDecimal(value);
   // The price may be left empty (= nothing pre-filled); currency and threshold may not
   const invalid = isCurrency
      ? value.trim() === ''
      : isPrice
        ? value.trim() !== '' && (parsed == null || parsed <= 0)
        : parsed == null || parsed <= 0;
   const title = isCurrency
      ? t('settings.currency')
      : isPrice
        ? t('settings.fuel_price')
        : t('settings.alert');

   const save = () => {
      setSubmitted(true);
      if (invalid) return;
      if (isCurrency) updateSettings({ currency: value.trim() || DEFAULT_SETTINGS.currency });
      else if (isPrice)
         updateSettings({
            fuelPricePerLiter: value.trim() === '' ? undefined : (parsed as number),
         });
      else updateSettings({ alertThresholdPercent: parsed as number });
      goBack();
   };

   return (
      <Screen withKeyboardAvoiding withSmallPadding={false}>
         <ScreenHeader title={title} onBack={goBack} backLabel={t('common.back')} />
         <ThemedView bg="transparent" gap="lg" className="flex-1 px-5 pt-6">
            <ThemedInput
               value={value}
               onChangeText={v => setValue(isPrice ? formatInput(v) : v)}
               size="lg"
               numeric={!isCurrency}
               autoFocus
               maxLength={isCurrency ? 6 : isPrice ? 9 : 3}
               keyboardType={isCurrency ? 'default' : isPrice ? 'decimal-pad' : 'number-pad'}
               suffix={
                  isCurrency ? undefined : isPrice ? `${settings.currency} / ${t('unit.l')}` : '%'
               }
               error={submitted && invalid ? t('common.required') : undefined}
               helperText={
                  isCurrency
                     ? t('settings.currency_hint')
                     : isPrice
                       ? t('settings.fuel_price_hint')
                       : t('settings.alert_hint')
               }
               accessibilityLabel={title}
            />
         </ThemedView>
         <ThemedView bg="transparent" className="px-5 pt-2 pb-7">
            <ThemedButton title={t('common.save')} size="lg" fullWidth onPress={save} />
         </ThemedView>
      </Screen>
   );
}

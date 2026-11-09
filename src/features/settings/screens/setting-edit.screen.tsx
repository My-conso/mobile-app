import React, { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/src/components/layout/screen';
import { ScreenHeader } from '@/src/components/layout/screen-header';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedInput } from '@/src/components/ui/themed-input';
import { ThemedButton } from '@/src/components/ui/themed-button';
import { useFuelStore } from '@/src/features/fuel/store';
import { DEFAULT_SETTINGS } from '@/src/features/fuel/types';
import { formatNumber, parseDecimal } from '@/src/lib/format';
import type { RootStackParamList } from '@/src/navigation/types';

/** Edits one app-wide preference (currency symbol or alert threshold) on its own small screen. */
export function SettingEditScreen() {
   const { t } = useTranslation('fuel');
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
   const { kind } = useRoute<RouteProp<RootStackParamList, 'SettingEdit'>>().params;
   const settings = useFuelStore(s => s.settings);
   const updateSettings = useFuelStore(s => s.updateSettings);

   const isCurrency = kind === 'currency';
   const [value, setValue] = useState(isCurrency ? settings.currency : formatNumber(settings.alertThresholdPercent, 0));
   const [submitted, setSubmitted] = useState(false);

   const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] }));

   const parsed = parseDecimal(value);
   const invalid = isCurrency ? value.trim() === '' : parsed == null || parsed <= 0;

   const save = () => {
      setSubmitted(true);
      if (invalid) return;
      if (isCurrency) updateSettings({ currency: value.trim() || DEFAULT_SETTINGS.currency });
      else updateSettings({ alertThresholdPercent: parsed as number });
      goBack();
   };

   return (
      <Screen withKeyboardAvoiding withSmallPadding={false}>
         <ScreenHeader title={isCurrency ? t('settings.currency') : t('settings.alert')} onBack={goBack} backLabel={t('common.back')} />
         <ThemedView bg="transparent" gap="lg" className="flex-1 px-5 pt-6">
            <ThemedInput
               value={value}
               onChangeText={setValue}
               size="lg"
               numeric={!isCurrency}
               autoFocus
               maxLength={isCurrency ? 6 : 3}
               keyboardType={isCurrency ? 'default' : 'number-pad'}
               suffix={isCurrency ? undefined : '%'}
               error={submitted && invalid ? t('common.required') : undefined}
               helperText={isCurrency ? t('settings.currency_hint') : t('settings.alert_hint')}
               accessibilityLabel={isCurrency ? t('settings.currency') : t('settings.alert')}
            />
         </ThemedView>
         <ThemedView bg="transparent" className="px-5 pt-2 pb-7">
            <ThemedButton title={t('common.save')} size="lg" fullWidth onPress={save} />
         </ThemedView>
      </Screen>
   );
}

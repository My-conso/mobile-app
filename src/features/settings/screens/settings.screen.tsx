import React from 'react';
import { Alert } from 'react-native';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Screen } from '@/src/components/layout/screen';
import { ScrollContainer } from '@/src/components/layout/scroll-container';
import { ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { SegmentedControl } from '@/src/components/ui/themed-segmented-control';
import { RowGroup } from '@/src/components/ui/themed-row-group';
import { ListRow } from '@/src/components/ui/themed-list-row';
import { useActiveVehicle, useFuelStore } from '@/src/features/fuel/store';
import { vehicleName } from '@/src/features/fuel/types';
import { showToast } from '@/src/providers/toast-provider';
import { showError } from '@/src/providers/error-provider';
import { formatNumber } from '@/src/lib/format';
import { parseBackupJson, toBackupJson, toCsv } from '@/src/lib/data-io';
import type { LanguageCodeSupportedT } from '@/src/i18n/types';
import type { RootStackParamList } from '@/src/navigation/types';

function SectionLabel({ children }: { children: string }) {
   return (
      <ThemedText variant="caption" color="muted" className="px-1 pt-2">
         {children}
      </ThemedText>
   );
}

export function SettingsScreen() {
   const { t, i18n } = useTranslation('fuel');
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

   const settings = useFuelStore(s => s.settings);
   const entries = useFuelStore(s => s.entries);
   const vehicles = useFuelStore(s => s.vehicles);
   const activeVehicleId = useFuelStore(s => s.activeVehicleId);
   const replaceAll = useFuelStore(s => s.replaceAll);
   const clearAll = useFuelStore(s => s.clearAll);
   const activeVehicle = useActiveVehicle();

   const language = (i18n.language === 'mg' ? 'mg' : 'fr') as LanguageCodeSupportedT;

   const share = async (filename: string, content: string, mimeType: string) => {
      try {
         if (!(await Sharing.isAvailableAsync())) {
            showToast('error', t('settings.export_error'));
            return;
         }
         const file = new File(Paths.cache, filename);
         if (file.exists) file.delete();
         file.create();
         file.write(content);
         await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: filename });
      } catch (e) {
         showError(e);
      }
   };

   const stamp = new Date().toISOString().slice(0, 10);
   const exportData = () =>
      Alert.alert(t('settings.export'), undefined, [
         {
            text: t('settings.export_json'),
            onPress: () =>
               share(
                  `tomo-${stamp}.json`,
                  toBackupJson({ entries, vehicles, activeVehicleId, settings }),
                  'application/json'
               ),
         },
         {
            text: t('settings.export_csv'),
            onPress: () => share(`tomo-${stamp}.csv`, toCsv(entries, vehicles), 'text/csv'),
         },
         { text: t('common.cancel'), style: 'cancel' },
      ]);

   const importBackup = async () => {
      try {
         const res = await DocumentPicker.getDocumentAsync({
            type: ['application/json', 'text/plain', '*/*'],
            copyToCacheDirectory: true,
         });
         if (res.canceled || !res.assets?.[0]) return;
         const text = await new File(res.assets[0].uri).text();
         const parsed = parseBackupJson(text);
         if (!parsed.ok) {
            showToast('error', t('settings.import_error'));
            return;
         }
         Alert.alert(
            t('settings.import_title'),
            t('settings.import_text', { count: formatNumber(parsed.entries.length) }),
            [
               { text: t('common.cancel'), style: 'cancel' },
               {
                  text: t('common.confirm'),
                  style: 'destructive',
                  onPress: () => {
                     // Photos aren't in the backup: keep the ones already on this device for the same vehicle ids
                     const keepPhoto = (id: string) => vehicles.find(v => v.id === id)?.photoUri;
                     replaceAll({
                        entries: parsed.entries,
                        vehicles: parsed.vehicles.map(v => ({ ...v, photoUri: keepPhoto(v.id) })),
                        activeVehicleId: parsed.activeVehicleId,
                        settings: parsed.settings,
                        onboardingDone: true,
                     });
                     showToast('success', t('settings.import_done'));
                  },
               },
            ]
         );
      } catch (e) {
         showError(e);
      }
   };

   const eraseAll = () =>
      Alert.alert(t('settings.erase_title'), t('settings.erase_text'), [
         { text: t('common.cancel'), style: 'cancel' },
         {
            text: t('common.continue'),
            style: 'destructive',
            onPress: () =>
               Alert.alert(t('settings.erase_title_2'), t('settings.erase_text_2'), [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                     text: t('settings.erase'),
                     style: 'destructive',
                     onPress: () => {
                        clearAll();
                        showToast('success', t('settings.erase_done'));
                     },
                  },
               ]),
         },
      ]);

   const languages: { value: LanguageCodeSupportedT; label: string }[] = [
      { value: 'fr', label: 'Français' },
      { value: 'mg', label: 'Malagasy' },
   ];

   return (
      <Screen safeAreaEdges={['top']} withSmallPadding={false} withDismissKeyboardOnOutside={false}>
         <ScrollContainer contentContainerClassName="gap-3 px-5 pt-7 pb-6">
            <ThemedText variant="h2">{t('settings.title')}</ThemedText>

            <SectionLabel>{t('settings.language')}</SectionLabel>
            <SegmentedControl
               options={languages}
               value={language}
               onChange={code => i18next.changeLanguage(code)}
            />

            <SectionLabel>
               {vehicles.length > 1 ? t('settings.vehicles') : t('settings.vehicle_one')}
            </SectionLabel>
            <RowGroup>
               {vehicles.map(v => (
                  <ListRow
                     key={v.id}
                     label={vehicleName(v)}
                     value={
                        v.id === activeVehicleId && vehicles.length > 1
                           ? t('settings.active')
                           : v.year
                             ? String(v.year)
                             : undefined
                     }
                     onPress={() => navigation.navigate('VehicleForm', { vehicleId: v.id })}
                  />
               ))}
               {activeVehicle ? (
                  <ListRow
                     label={t('settings.tank')}
                     value={
                        activeVehicle.tankCapacityLiters != null
                           ? `${formatNumber(activeVehicle.tankCapacityLiters, 1).replace(/,0$/, '')} ${t('unit.l')}`
                           : t('settings.tank_unset')
                     }
                     tone={activeVehicle.tankCapacityLiters != null ? 'default' : 'primary'}
                     onPress={() =>
                        navigation.navigate('VehicleForm', {
                           vehicleId: activeVehicle.id,
                           focus: 'tank',
                        })
                     }
                  />
               ) : null}
               <ListRow
                  label={t('settings.vehicle_add')}
                  icon="plus"
                  onPress={() => navigation.navigate('VehicleForm')}
               />
            </RowGroup>

            <SectionLabel>{t('settings.preferences')}</SectionLabel>
            <RowGroup>
               <ListRow
                  label={t('settings.fuel_price')}
                  value={
                     settings.fuelPricePerLiter != null
                        ? `${formatNumber(settings.fuelPricePerLiter, 2).replace(/,00$/, '')} ${settings.currency}`
                        : t('settings.tank_unset')
                  }
                  tone={settings.fuelPricePerLiter != null ? 'default' : 'primary'}
                  onPress={() => navigation.navigate('SettingEdit', { kind: 'price' })}
               />
               <ListRow
                  label={t('settings.currency')}
                  value={settings.currency}
                  onPress={() => navigation.navigate('SettingEdit', { kind: 'currency' })}
               />
               <ListRow
                  label={t('settings.alert')}
                  value={`+${formatNumber(settings.alertThresholdPercent, 0)} %`}
                  onPress={() => navigation.navigate('SettingEdit', { kind: 'alert' })}
               />
            </RowGroup>

            <SectionLabel>{t('settings.data')}</SectionLabel>
            <RowGroup>
               <ListRow
                  label={t('settings.export')}
                  icon="download"
                  chevron={false}
                  onPress={exportData}
               />
               <ListRow
                  label={t('settings.import')}
                  icon="upload"
                  chevron={false}
                  onPress={importBackup}
               />
               <ListRow
                  label={t('settings.erase')}
                  icon="trash"
                  tone="danger"
                  chevron={false}
                  onPress={eraseAll}
               />
            </RowGroup>

            <ThemedView bg="transparent" className="pt-1">
               <ThemedText variant="caption" color="muted" align="center">
                  {t('settings.footer', { version: Constants.expoConfig?.version ?? '1.0' })}
               </ThemedText>
            </ThemedView>
         </ScrollContainer>
      </Screen>
   );
}

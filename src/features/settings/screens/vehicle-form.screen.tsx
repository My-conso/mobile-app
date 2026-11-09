import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '@/src/components/layout/screen';
import { ScreenHeader } from '@/src/components/layout/screen-header';
import { ScrollContainer } from '@/src/components/layout/scroll-container';
import { Row, ThemedView } from '@/src/components/ui/themed-view';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedButton } from '@/src/components/ui/themed-button';
import { ThemedIcon } from '@/src/components/ui/themed-icon';
import { ThemedPressable } from '@/src/components/ui/themed-pressable';
import { VehicleAvatar } from '@/src/features/fuel/components/vehicle-avatar';
import { VehicleFields } from '@/src/features/fuel/components/vehicle-fields';
import { useFuelStore } from '@/src/features/fuel/store';
import { vehicleName } from '@/src/features/fuel/types';
import { formatNumber } from '@/src/lib/format';
import { validateVehicleDraft, type VehicleDraftInput } from '@/src/lib/validation';
import { deleteVehiclePhoto, saveVehiclePhoto } from '@/src/lib/vehicle-photo';
import { showToast } from '@/src/providers/toast-provider';
import { showError } from '@/src/providers/error-provider';
import type { RootStackParamList } from '@/src/navigation/types';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
   mediaTypes: ['images'],
   allowsEditing: true, // lets the user crop to a square
   aspect: [1, 1],
   quality: 0.7,
};

export function VehicleFormScreen() {
   const { t } = useTranslation('fuel');
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
   const route = useRoute<RouteProp<RootStackParamList, 'VehicleForm'>>();
   const vehicleId = route.params?.vehicleId;

   const vehicles = useFuelStore(s => s.vehicles);
   const entries = useFuelStore(s => s.entries);
   const addVehicle = useFuelStore(s => s.addVehicle);
   const updateVehicle = useFuelStore(s => s.updateVehicle);
   const deleteVehicle = useFuelStore(s => s.deleteVehicle);

   const existing = vehicles.find(v => v.id === vehicleId);
   const isEdit = !!existing;

   const [draft, setDraft] = useState<VehicleDraftInput>({
      brand: existing?.brand ?? '',
      model: existing?.model ?? '',
      year: existing?.year ? String(existing.year) : '',
      cc: existing?.displacementCc ? String(existing.displacementCc) : '',
      tank: existing?.tankCapacityLiters != null ? formatNumber(existing.tankCapacityLiters, 2).replace(/,?0+$/, '') : '',
   });
   // The photo is only written to permanent storage on Save, so cancelling leaves no orphan file.
   const [photoUri, setPhotoUri] = useState<string | undefined>(existing?.photoUri);
   const [submitted, setSubmitted] = useState(false);

   const goBack = () => {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
   };

   const result = validateVehicleDraft(draft);

   const pick = async (source: 'camera' | 'library') => {
      try {
         if (source === 'camera') {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
               showToast('error', t('vehicle_form.photo_permission'));
               return;
            }
         }
         const res =
            source === 'camera'
               ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
               : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
         if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
      } catch (e) {
         showToast('error', t('vehicle_form.photo_error'));
         if (__DEV__) showError(e);
      }
   };

   const onSave = () => {
      setSubmitted(true);
      if (result.hasErrors) return;
      try {
         // Copy only when the photo changed (a new pick lives in the picker's cache)
         const changed = photoUri !== existing?.photoUri;
         const finalPhoto = changed && photoUri ? saveVehiclePhoto(photoUri, existing?.id ?? 'new') : photoUri;
         if (changed) deleteVehiclePhoto(existing?.photoUri);

         const value = { ...result.value, photoUri: finalPhoto };
         if (isEdit && vehicleId) updateVehicle(vehicleId, value);
         else addVehicle(value);
         showToast('success', t('vehicle_form.saved'));
         goBack();
      } catch (e) {
         showError(e);
      }
   };

   const onDelete = () => {
      if (!vehicleId || !existing) return;
      const count = entries.filter(e => e.vehicleId === vehicleId).length;
      Alert.alert(t('vehicle_form.delete_title', { name: vehicleName(existing) }), t('vehicle_form.delete_text', { count }), [
         { text: t('common.cancel'), style: 'cancel' },
         {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => {
               deleteVehicle(vehicleId);
               showToast('success', t('vehicle_form.deleted'));
               goBack();
            },
         },
      ]);
   };

   return (
      <Screen withKeyboardAvoiding withSmallPadding={false}>
         <ScreenHeader title={isEdit ? t('vehicle_form.title_edit') : t('vehicle_form.title_new')} onBack={goBack} backLabel={t('common.back')} />

         <ScrollContainer contentContainerClassName="gap-6 px-5 pt-4 pb-6" keyboardShouldPersistTaps="handled">
            <ThemedView gap="md" bg="transparent" className="items-center">
               <VehicleAvatar vehicle={{ brand: draft.brand || '?', model: draft.model, photoUri }} size="xl" />
               <ThemedText variant="caption" color="secondary" align="center">
                  {t('vehicle_form.photo_help')}
               </ThemedText>
               <Row gap="md" bg="transparent">
                  <ThemedButton
                     title={t('vehicle_form.photo_take')}
                     variant="outline"
                     size="sm"
                     leftIcon={<ThemedIcon name="camera" size="sm" />}
                     onPress={() => pick('camera')}
                  />
                  <ThemedButton
                     title={t('vehicle_form.photo_pick')}
                     variant="outline"
                     size="sm"
                     leftIcon={<ThemedIcon name="image" size="sm" />}
                     onPress={() => pick('library')}
                  />
               </Row>
               {photoUri ? (
                  <ThemedPressable onPress={() => setPhotoUri(undefined)} className="min-h-11 flex-row items-center gap-2 px-3">
                     <ThemedIcon name="trash" color="danger" size="sm" />
                     <ThemedText variant="body-small" weight="medium" color="danger">
                        {t('vehicle_form.photo_remove')}
                     </ThemedText>
                  </ThemedPressable>
               ) : null}
            </ThemedView>

            <VehicleFields draft={draft} onChange={patch => setDraft(d => ({ ...d, ...patch }))} errors={submitted ? result.errors : undefined} />
         </ScrollContainer>

         <ThemedView bg="transparent" gap="sm" className="px-5 pt-2 pb-7">
            <ThemedButton title={t('vehicle_form.save')} size="lg" fullWidth onPress={onSave} />
            {isEdit ? (
               <ThemedButton title={t('vehicle_form.delete')} variant="outline" size="md" fullWidth textClassName="text-danger" onPress={onDelete} />
            ) : null}
         </ThemedView>
      </Screen>
   );
}

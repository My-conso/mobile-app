import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
   Home: undefined;
   History: undefined;
   Stats: undefined;
   Settings: undefined;
};

export type RootStackParamList = {
   /** First launch only: language → bike → welcome */
   Onboarding: undefined;
   Tabs: NavigatorScreenParams<TabParamList> | undefined;
   /** No entryId → new fill-up, entryId → edit */
   FuelForm: { entryId?: string } | undefined;
   /** No vehicleId → new vehicle, vehicleId → edit; focus → scroll to that field and highlight it */
   VehicleForm: { vehicleId?: string; focus?: 'tank' } | undefined;
   /** One app-wide preference on its own screen */
   SettingEdit: { kind: 'currency' | 'alert' | 'price' };
};

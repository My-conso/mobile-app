import React from 'react';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '@/src/constants/color';
import { useFuelStore } from '@/src/features/fuel/store';
import { OnboardingScreen } from '@/src/features/onboarding/screens/onboarding.screen';
import { FuelFormScreen } from '@/src/features/fuel-form/screens/fuel-form.screen';
import { VehicleFormScreen } from '@/src/features/settings/screens/vehicle-form.screen';
import { SettingEditScreen } from '@/src/features/settings/screens/setting-edit.screen';
import { RootStackParamList } from './types';
import { TabNavigator } from './tab-navigator';
import { navigationRef } from './navigation-ref';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Navigation colours come from the palette (dark only), so no white flash between screens
const palette = COLORS.dark;
const navigationTheme: Theme = {
   ...DarkTheme,
   colors: {
      ...DarkTheme.colors,
      primary: palette.primary,
      background: palette.background,
      card: palette.card,
      text: palette.foreground,
      border: palette.border,
      notification: palette.danger,
   },
};

export function RootNavigator() {
   const onboardingDone = useFuelStore(s => s.onboardingDone);

   return (
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
         <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }}>
            {onboardingDone ? (
               <>
                  <Stack.Screen name="Tabs" component={TabNavigator} />
                  <Stack.Screen name="FuelForm" component={FuelFormScreen} options={{ presentation: 'modal' }} />
                  <Stack.Screen name="VehicleForm" component={VehicleFormScreen} options={{ presentation: 'modal' }} />
                  <Stack.Screen name="SettingEdit" component={SettingEditScreen} options={{ presentation: 'modal' }} />
               </>
            ) : (
               // First launch: nothing else is reachable until the language and the bike are set
               <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ gestureEnabled: false }} />
            )}
         </Stack.Navigator>
      </NavigationContainer>
   );
}

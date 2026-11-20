import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { TabBar } from '@/src/components/layout/tab-bar';
import { useOpenFuelForm } from '@/src/features/fuel/hooks';
import type { TabParamList } from './types';
import { HomeScreen } from '@/src/features/home/screens/home.screen';
import { HistoryScreen } from '@/src/features/history/screens/history.screen';
import { StatsScreen } from '@/src/features/stats/screens/stats.screen';
import { SettingsScreen } from '@/src/features/settings/screens/settings.screen';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
   const { t } = useTranslation('fuel');
   const openFuelForm = useOpenFuelForm();
   // Night gradient drawn once behind all tabs (the tab screens are transparent): the fade between two tabs
   // then no longer repaints two full-screen gradients per frame
   const top = useThemeColor('--color-background-top', 'backgroundTop');
   const mid = useThemeColor('--color-background', 'background');
   const bottom = useThemeColor('--color-background-bottom', 'backgroundBottom');

   return (
      <View style={{ flex: 1, backgroundColor: mid }}>
         <LinearGradient
            colors={[top, mid, bottom]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
         />
         <Tab.Navigator
            backBehavior="history"
            screenOptions={{
               headerShown: false,
               animation: 'none',
               sceneStyle: { backgroundColor: 'transparent' },
            }}
            tabBar={props => (
               <TabBar
                  {...props}
                  left={[
                     { route: 'Home', label: t('nav.home'), icon: 'home' },
                     { route: 'History', label: t('nav.history'), icon: 'list' },
                  ]}
                  right={[
                     { route: 'Stats', label: t('nav.stats'), icon: 'bar-chart' },
                     { route: 'Settings', label: t('nav.settings'), icon: 'sliders' },
                  ]}
                  action={{ label: t('nav.add'), onPress: () => openFuelForm() }}
               />
            )}>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Stats" component={StatsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
         </Tab.Navigator>
      </View>
   );
}

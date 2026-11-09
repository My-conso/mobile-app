import React from 'react';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Row, ThemedView } from '../ui/themed-view';
import { ThemedText } from '../ui/themed-text';
import { ThemedIcon, type IconName } from '../ui/themed-icon';
import { ThemedPressable } from '../ui/themed-pressable';
import { cn } from '@/src/utils/tailwind';

export interface TabBarItem {
   /** Route name of the tab */
   route: string;
   label: string;
   icon: IconName;
}

interface TabBarProps extends BottomTabBarProps {
   /** Tabs shown on the left of the main action */
   left: TabBarItem[];
   /** Tabs shown on the right of the main action */
   right: TabBarItem[];
   /** Main action (centre "+" button) */
   action: { label: string; onPress: () => void };
}

/**
 * Floating navigation: [tab] [tab] (+) [tab] [tab]. The centre button is an action, not a tab.
 */
export function TabBar({ state, navigation, left, right, action }: TabBarProps) {
   const insets = useSafeAreaInsets();
   const activeRoute = state.routes[state.index]?.name;

   const renderTab = (item: TabBarItem) => {
      const active = activeRoute === item.route;
      return (
         <ThemedPressable
            key={item.route}
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            onPress={() => {
               if (!active) navigation.navigate(item.route);
            }}
            className="h-13 min-w-0 flex-1 items-center justify-center gap-[3px]">
            <ThemedIcon name={item.icon} customSize={22} color={active ? 'primary' : 'muted'} />
            <ThemedText variant="caption" className="text-[11px]" color={active ? 'primary' : 'muted'} numberOfLines={1}>
               {item.label}
            </ThemedText>
         </ThemedPressable>
      );
   };

   return (
      // bottom margin follows the phone's gesture bar (dynamic inset)
      <ThemedView bg="transparent" className="px-5 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 16) + 10 }}>
         <Row items="center" bg="card" className={cn('border-border h-17 rounded-[26px] border px-1.5')}>
            {left.map(renderTab)}
            <ThemedPressable
               accessibilityLabel={action.label}
               onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  action.onPress();
               }}
               className="bg-primary mx-1 size-14 items-center justify-center rounded-[18px]">
               <ThemedIcon name="plus" size="xxl" color="inverse" strokeWidth={2.4} />
            </ThemedPressable>
            {right.map(renderTab)}
         </Row>
      </ThemedView>
   );
}

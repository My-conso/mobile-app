import React, { useEffect } from 'react';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
   Easing,
   ReduceMotion,
   useAnimatedStyle,
   useSharedValue,
   withDelay,
   withSequence,
   withTiming,
} from 'react-native-reanimated';
import { Row, ThemedView } from '../ui/themed-view';
import { ThemedIcon, type IconName } from '../ui/themed-icon';
import { ThemedPressable } from '../ui/themed-pressable';
import { haptic } from '@/src/lib/haptics';

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

/** Icon of a tab: pops (0.7 → 1.22 → 1, 420 ms) each time the tab becomes the active one. Transform only. */
function TabIcon({ icon, active }: { icon: IconName; active: boolean }) {
   const scale = useSharedValue(1);
   useEffect(() => {
      if (!active) return;
      scale.value = 0.7;
      scale.value = withDelay(
         120,
         withSequence(
            withTiming(1.22, {
               duration: 230,
               easing: Easing.out(Easing.cubic),
               reduceMotion: ReduceMotion.System,
            }),
            withTiming(1, { duration: 190, reduceMotion: ReduceMotion.System })
         )
      );
   }, [active, scale]);
   const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
   return (
      <Animated.View style={style}>
         <ThemedIcon name={icon} customSize={22} color={active ? 'primary' : 'muted'} />
      </Animated.View>
   );
}

/**
 * Floating pill navigation: [tab] [tab] (+) [tab] [tab], icons only. The centre button is an action, not a tab:
 * it turns a quarter turn when pressed.
 */
export function TabBar({ state, navigation, left, right, action }: TabBarProps) {
   const insets = useSafeAreaInsets();
   const activeRoute = state.routes[state.index]?.name;
   const turn = useSharedValue(0);
   const turnStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));

   const renderTab = (item: TabBarItem) => {
      const active = activeRoute === item.route;
      return (
         <ThemedPressable
            key={item.route}
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            pressScale={0.9}
            onPress={() => {
               if (!active) navigation.navigate(item.route);
            }}
            className="size-13 items-center justify-center">
            <TabIcon icon={item.icon} active={active} />
         </ThemedPressable>
      );
   };

   return (
      // bottom margin follows the phone's gesture bar (dynamic inset)
      <ThemedView
         bg="transparent"
         className="px-5 pt-3"
         style={{ paddingBottom: Math.max(insets.bottom, 16) + 10 }}>
         <Row items="center" justify="between" bg="card" className="h-16 rounded-full px-2">
            {left.map(renderTab)}
            <ThemedPressable
               accessibilityLabel={action.label}
               pressScale={0.9}
               onPress={() => {
                  haptic.light();
                  turn.value = withTiming(90, {
                     duration: 300,
                     easing: Easing.out(Easing.back(1.6)),
                     reduceMotion: ReduceMotion.System,
                  });
                  // Back to the start once the form has opened over the tabs
                  setTimeout(() => {
                     turn.value = 0;
                  }, 500);
                  action.onPress();
               }}
               className="bg-primary size-13 items-center justify-center rounded-full">
               <Animated.View style={turnStyle}>
                  <ThemedIcon name="plus" size="xl" color="inverse" strokeWidth={2.4} />
               </Animated.View>
            </ThemedPressable>
            {right.map(renderTab)}
         </Row>
      </ThemedView>
   );
}

import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

/**
 * Returns to the screen the user came from (Home, History, Settings…).
 * If there is no previous screen (a form opened first), falls back to the tabs.
 */
export function useGoBack() {
   const navigation = useNavigation();
   return useCallback(() => {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] } as never);
   }, [navigation]);
}

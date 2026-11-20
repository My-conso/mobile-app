import * as Haptics from 'expo-haptics';

// Haptics never throw into the UI: some devices have no vibration motor or block it.
const safe = (fn: () => Promise<void>) => {
   try {
      void fn().catch(() => {});
   } catch {
      /* no haptics */
   }
};

export const haptic = {
   /** Toggle, selection change */
   selection: () => safe(() => Haptics.selectionAsync()),
   /** Press on a main action */
   light: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
   /** Threshold crossed (delete…) */
   medium: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
   success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
   error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};

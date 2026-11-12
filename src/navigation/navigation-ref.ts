import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/** Lets code outside a screen (e.g. the end of the first-launch flow) navigate. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const MAX_ATTEMPTS = 30;

/**
 * Navigates to `name` as soon as that screen exists in the root stack.
 * Needed right after a state change that swaps the stack's screens (first launch → app):
 * the new screens are only registered after the next render, so we retry for a few frames.
 */
export function navigateWhenReady(
   name: keyof RootStackParamList,
   params?: object,
   schedule: (cb: () => void) => void = cb => requestAnimationFrame(cb),
): void {
   let attempts = 0;
   const attempt = () => {
      const ready = navigationRef.isReady() && navigationRef.getRootState()?.routeNames?.includes(name);
      if (ready) {
         (navigationRef.navigate as (n: string, p?: object) => void)(name, params);
         return;
      }
      if (++attempts < MAX_ATTEMPTS) schedule(attempt);
   };
   attempt();
}

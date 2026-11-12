import { navigateWhenReady, navigationRef } from '../navigation-ref';

describe('navigateWhenReady', () => {
   afterEach(() => jest.restoreAllMocks());

   it('attend que l’écran existe, puis navigue une seule fois', () => {
      const navigate = jest.fn();
      let calls = 0;
      jest.spyOn(navigationRef, 'isReady').mockImplementation(() => ++calls > 2);
      jest.spyOn(navigationRef, 'getRootState').mockReturnValue({ routeNames: ['Tabs', 'FuelForm'] } as never);
      (navigationRef as unknown as { navigate: unknown }).navigate = navigate;

      const queue: (() => void)[] = [];
      navigateWhenReady('FuelForm', undefined, cb => queue.push(cb));
      expect(navigate).not.toHaveBeenCalled();
      while (queue.length) queue.shift()!();
      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith('FuelForm', undefined);
   });

   it('abandonne sans erreur si l’écran n’apparaît jamais', () => {
      const navigate = jest.fn();
      jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);
      jest.spyOn(navigationRef, 'getRootState').mockReturnValue({ routeNames: ['Onboarding'] } as never);
      (navigationRef as unknown as { navigate: unknown }).navigate = navigate;

      const queue: (() => void)[] = [];
      navigateWhenReady('FuelForm', undefined, cb => queue.push(cb));
      let guard = 0;
      while (queue.length && guard++ < 100) queue.shift()!();
      expect(navigate).not.toHaveBeenCalled();
      expect(guard).toBeLessThan(100);
   });
});

import './global.css';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ToastProvider } from './src/providers/toast-provider';
import { CacheProvider } from './src/providers/cache-provider';
import { BottomSheetProvider } from './src/providers/sheet-provider';
import { ErrorProvider } from './src/providers/error-provider';
import { RootNavigator } from './src/navigation/root-navigator';

// Keep the native splash until the fonts are ready, so text never flashes in a system font
SplashScreen.preventAutoHideAsync();

export default function App() {
   const [fontsLoaded, fontError] = useFonts({
      Inter_400Regular,
      Inter_500Medium,
      Inter_600SemiBold,
      SpaceGrotesk_500Medium,
      SpaceGrotesk_600SemiBold,
      SpaceGrotesk_700Bold,
   });
   const ready = fontsLoaded || !!fontError;

   useEffect(() => {
      if (ready) SplashScreen.hideAsync();
   }, [ready]);

   if (!ready) return null;

   return (
      <GestureHandlerRootView className="flex-1">
         <SafeAreaProvider>
            <ThemeProvider>
               <CacheProvider>
                  <KeyboardProvider>
                     <ToastProvider>
                        <ErrorProvider>
                           <BottomSheetProvider>
                              <RootNavigator />
                           </BottomSheetProvider>
                        </ErrorProvider>
                     </ToastProvider>
                  </KeyboardProvider>
               </CacheProvider>
            </ThemeProvider>
         </SafeAreaProvider>
      </GestureHandlerRootView>
   );
}

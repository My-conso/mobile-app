import './global.css';
import { useCallback, useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Kanit_700Bold_Italic, Kanit_800ExtraBold_Italic } from '@expo-google-fonts/kanit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ToastProvider } from './src/providers/toast-provider';
import { CacheProvider } from './src/providers/cache-provider';
import { BottomSheetProvider } from './src/providers/sheet-provider';
import { ErrorProvider } from './src/providers/error-provider';
import { RootNavigator } from './src/navigation/root-navigator';
import { AnimatedSplash } from './src/components/feedback/animated-splash';

// Keep the native splash until the fonts are ready, so text never flashes in a system font
SplashScreen.preventAutoHideAsync();

export default function App() {
   const [fontsLoaded, fontError] = useFonts({
      Inter_400Regular,
      Inter_500Medium,
      Inter_600SemiBold,
      Kanit_700Bold_Italic,
      Kanit_800ExtraBold_Italic,
   });
   const ready = fontsLoaded || !!fontError;
   // Animated start screen over the app, then it fades out
   const [splashDone, setSplashDone] = useState(false);
   const endSplash = useCallback(() => setSplashDone(true), []);

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
                              {splashDone ? null : <AnimatedSplash onDone={endSplash} />}
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

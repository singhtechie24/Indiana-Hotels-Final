import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useCallback, useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { View } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          'Lufga-Regular': require('./assets/fonts/lufga-cufonfonts/LufgaRegular.ttf'),
          'Lufga-Medium': require('./assets/fonts/lufga-cufonfonts/LufgaMedium.ttf'),
          'Lufga-SemiBold': require('./assets/fonts/lufga-cufonfonts/LufgaSemiBold.ttf'),
          'Lufga-Bold': require('./assets/fonts/lufga-cufonfonts/LufgaBold.ttf'),
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <AppNavigator />
          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

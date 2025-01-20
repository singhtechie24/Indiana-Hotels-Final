import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { theme } from './src/constants/theme';
import { AppNavigator } from './src/navigation/AppNavigator';
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
        
        // Artificially delay for two seconds to simulate a slow loading
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn('Error loading resources:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <StripeProvider
          publishableKey="pk_test_51QgghQRwXoewKBeCzVpDaRgBdrgPKTIwiFG9zt6E9AHiLODTgOo24YHLip6cfVzsEhNL1c2UVY8v1LbN8mTyXhud004YiMeAi6"
          merchantIdentifier="merchant.com.indianahotels.mobile"
        >
          <SafeAreaProvider>
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <AppNavigator />
            </View>
          </SafeAreaProvider>
        </StripeProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

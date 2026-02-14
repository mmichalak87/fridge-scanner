import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n, { loadSavedLanguage } from '../src/locales/i18n';
import { initRevenueCat } from '../src/services/subscription';
import { logger } from '../src/utils/errorLogger';

function RootLayout() {
  useEffect(() => {
    logger.log('App starting...');
    loadSavedLanguage();
    initRevenueCat();

    // Firebase is currently disabled in app.config.js for TestFlight testing
    // Uncomment the code below when Firebase is re-enabled in app.config.js

    // const initializeFirebase = async () => {
    //   try {
    //     logger.log('Initializing Firebase...');
    //     const firebaseModule = await import('@react-native-firebase/app');
    //     const crashlyticsModule = await import('@react-native-firebase/crashlytics');
    //
    //     const firebase = firebaseModule.default;
    //     const crashlytics = crashlyticsModule.default;
    //
    //     if (firebase && firebase.apps && firebase.apps.length > 0) {
    //       logger.log('Firebase initialized', firebase.app().name);
    //       await crashlytics().setCrashlyticsCollectionEnabled(true);
    //       logger.log('Crashlytics enabled');
    //       await crashlytics().setUserId('user-' + Date.now());
    //       crashlytics().log('App started successfully');
    //     } else {
    //       logger.warn('Firebase not initialized - continuing without it');
    //     }
    //   } catch (error) {
    //     logger.error('Firebase/Crashlytics not available', error);
    //   }
    // };
    //
    // initializeFirebase();

    logger.log('App started successfully (Firebase disabled)');
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
            },
            headerBackTitle: ' ',
            contentStyle: {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              title: '',
              headerBackTitle: ' ',
            }}
          />
          <Stack.Screen
            name="camera"
            options={{
              title: 'Scan',
              presentation: 'fullScreenModal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="results"
            options={{
              title: 'Results',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: 'Settings',
            }}
          />
          <Stack.Screen
            name="favorites"
            options={{
              title: 'Favorites',
            }}
          />
          <Stack.Screen
            name="paywall"
            options={{
              title: 'Pro',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="debug-logs"
            options={{
              title: 'Debug Logs',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}

export default RootLayout;

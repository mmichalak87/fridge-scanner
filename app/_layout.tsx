import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n, { loadSavedLanguage } from '../src/locales/i18n';
import { initRevenueCat } from '../src/services/subscription';

function RootLayout() {
  useEffect(() => {
    loadSavedLanguage();
    initRevenueCat();

    // Initialize Firebase and Crashlytics (optional - won't crash if fails)
    const initializeFirebase = async () => {
      try {
        // Try to initialize Firebase - if it fails, app continues
        const firebaseModule = await import('@react-native-firebase/app');
        const crashlyticsModule = await import('@react-native-firebase/crashlytics');

        const firebase = firebaseModule.default;
        const crashlytics = crashlyticsModule.default;

        // Check if Firebase is properly initialized
        if (firebase && firebase.apps && firebase.apps.length > 0) {
          console.log('✅ Firebase initialized:', firebase.app().name);

          // Enable Crashlytics
          await crashlytics().setCrashlyticsCollectionEnabled(true);
          console.log('✅ Crashlytics enabled');

          // Set user identifier
          await crashlytics().setUserId('user-' + Date.now());
          crashlytics().log('App started successfully');
        } else {
          console.log('⚠️ Firebase not initialized - continuing without it');
        }
      } catch (error) {
        console.log('⚠️ Firebase/Crashlytics not available:', error);
        // App continues normally without Firebase
      }
    };

    // Initialize Firebase in background (non-blocking)
    initializeFirebase();
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
        </Stack>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}

export default RootLayout;

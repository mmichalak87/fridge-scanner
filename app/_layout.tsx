import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import crashlytics from '@react-native-firebase/crashlytics';
import i18n, { loadSavedLanguage } from '../src/locales/i18n';
import { initRevenueCat } from '../src/services/subscription';

function RootLayout() {
  useEffect(() => {
    loadSavedLanguage();
    initRevenueCat();

    // Enable Crashlytics crash collection
    crashlytics().setCrashlyticsCollectionEnabled(true);
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

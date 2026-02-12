import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import i18n, { loadSavedLanguage } from '../src/locales/i18n';
import { initRevenueCat } from '../src/services/subscription';

const SENTRY_DSN = Platform.OS === 'ios'
  ? process.env.EXPO_PUBLIC_SENTRY_DSN_IOS
  : process.env.EXPO_PUBLIC_SENTRY_DSN_ANDROID;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    _experiments: {
      profilesSampleRate: 1.0,
    },
  });
}

function RootLayout() {
  useEffect(() => {
    loadSavedLanguage();
    initRevenueCat();
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

export default SENTRY_DSN ? Sentry.wrap(RootLayout) : RootLayout;

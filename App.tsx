import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n, { loadSavedLanguage } from './src/locales/i18n';
import { initRevenueCat } from './src/services/subscription';
import { logger } from './src/utils/errorLogger';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    logger.log('App starting...');
    import('@react-native-firebase/crashlytics').then(({ default: crashlytics }) => {
      crashlytics().setCrashlyticsCollectionEnabled(true);
    });
    import('@react-native-firebase/analytics').then(({ default: analytics }) => {
      analytics().setAnalyticsCollectionEnabled(true);
    });
    loadSavedLanguage();
    initRevenueCat();
    logger.log('App started successfully');
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en';
import pl from './pl';
import uk from './uk';
import de from './de';

const LANGUAGE_KEY = 'app_language';

const resources = {
  en: { translation: en },
  pl: { translation: pl },
  uk: { translation: uk },
  de: { translation: de },
};

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

const getDeviceLanguage = (): string => {
  const locales = RNLocalize.getLocales();
  const deviceLocale = locales[0]?.languageCode || 'en';
  const supportedLanguages = LANGUAGES.map(l => l.code);
  return supportedLanguages.includes(deviceLocale) ? deviceLocale : 'en';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Load saved language
export const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && LANGUAGES.some(l => l.code === savedLanguage)) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error('Error loading saved language:', error);
  }
};

// Save language preference
export const saveLanguage = async (langCode: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, langCode);
    await i18n.changeLanguage(langCode);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

export default i18n;

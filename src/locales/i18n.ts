import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import en from './en';
import pl from './pl';
import uk from './uk';
import de from './de';

const resources = {
  en: { translation: en },
  pl: { translation: pl },
  uk: { translation: uk },
  de: { translation: de },
};

const SUPPORTED_LANGUAGES = ['en', 'pl', 'uk', 'de'];

const getDeviceLanguage = (): string => {
  const locales = RNLocalize.getLocales();
  const deviceLocale = locales[0]?.languageCode || 'en';
  return SUPPORTED_LANGUAGES.includes(deviceLocale) ? deviceLocale : 'en';
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

export default i18n;

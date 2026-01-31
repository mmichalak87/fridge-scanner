import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from 'expo-router';
import { LANGUAGES, saveLanguage } from '../src/locales/i18n';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: t('settings.title'),
    });
  }, [i18n.language]);

  const changeLanguage = async (langCode: string) => {
    await saveLanguage(langCode);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.languageList}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                i18n.language === lang.code && styles.languageItemActive,
              ]}
              onPress={() => changeLanguage(lang.code)}
            >
              <View style={styles.languageInfo}>
                <Text
                  style={[
                    styles.languageName,
                    i18n.language === lang.code && styles.languageNameActive,
                  ]}
                >
                  {lang.nativeName}
                </Text>
                <Text style={styles.languageNameEn}>{lang.name}</Text>
              </View>
              {i18n.language === lang.code && (
                <Text style={styles.checkmark}>+</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.appName}>{t('settings.appName')}</Text>
          <Text style={styles.appVersion}>{t('settings.version')}</Text>
          <Text style={styles.appDescription}>
            {t('settings.appDescription')}
          </Text>
          <Text style={styles.poweredBy}>{t('settings.poweredBy')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  languageList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageItemActive: {
    backgroundColor: '#E8F5E9',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  languageNameActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  languageNameEn: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: '600',
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  poweredBy: {
    fontSize: 12,
    color: '#999',
  },
});

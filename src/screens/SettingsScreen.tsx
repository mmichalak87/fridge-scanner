import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSubscription } from '../hooks/useSubscription';
import { getAppUserId } from '../services/subscription';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/types';

const appVersion = require('../../package.json').version;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { isPro, remainingScans, restore } = useSubscription();
  const [appUserId, setAppUserId] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: t('settings.title'),
    });
  }, [navigation, t, i18n.language]);

  useEffect(() => {
    if (isPro) {
      getAppUserId().then(setAppUserId);
    }
  }, [isPro]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Subscription Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('subscription.currentPlan')}</Text>
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View style={[styles.planChip, isPro && styles.planChipPro]}>
              <Ionicons
                name={isPro ? 'diamond' : 'person'}
                size={14}
                color={isPro ? '#FFD700' : '#666'}
              />
              <Text style={[styles.planChipText, isPro && styles.planChipTextPro]}>
                {isPro ? t('subscription.pro') : t('subscription.free')}
              </Text>
            </View>
            <Text style={styles.scanInfo}>
              {isPro
                ? t('subscription.unlimited')
                : t('subscription.remainingScans', { count: remainingScans as number })}
            </Text>
          </View>
          {!isPro && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Paywall')}
            >
              <Ionicons name="diamond" size={18} color="#fff" />
              <Text style={styles.upgradeButtonText}>{t('subscription.upgrade')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={async () => {
              const success = await restore();
              Alert.alert(
                '',
                success ? t('subscription.restoreSuccess') : t('subscription.restoreFailed')
              );
            }}
          >
            <Text style={styles.restoreButtonText}>{t('subscription.restore')}</Text>
          </TouchableOpacity>
          {isPro && appUserId && (
            <TouchableOpacity
              style={styles.appUserIdContainer}
              onPress={() => {
                Clipboard.setString(appUserId);
                Alert.alert('', t('subscription.appUserIdCopied'));
              }}
            >
              <Text style={styles.appUserIdLabel}>{t('subscription.appUserId')}</Text>
              <View style={styles.appUserIdRow}>
                <Text style={styles.appUserIdValue} numberOfLines={1}>
                  {appUserId}
                </Text>
                <Ionicons name="copy-outline" size={16} color="#888" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.appName}>{t('settings.appName')}</Text>
          <Text style={styles.appVersion}>{t('settings.version', { version: appVersion })}</Text>
          <Text style={styles.appDescription}>{t('settings.appDescription')}</Text>
          <Text style={styles.poweredBy}>{t('settings.poweredBy')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  subscriptionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  planChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  planChipPro: { backgroundColor: '#2E7D32' },
  planChipText: { fontSize: 14, fontWeight: '700', color: '#666' },
  planChipTextPro: { color: '#fff' },
  scanInfo: { fontSize: 13, color: '#888', fontWeight: '500' },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 8,
  },
  upgradeButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  restoreButton: { alignItems: 'center', paddingVertical: 10 },
  restoreButtonText: { fontSize: 14, color: '#4CAF50', fontWeight: '500' },
  appUserIdContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  appUserIdLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  appUserIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appUserIdValue: { fontSize: 13, color: '#666', fontFamily: 'monospace', flex: 1 },
  aboutCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  appName: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  appVersion: { fontSize: 14, color: '#888', marginBottom: 16 },
  appDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  poweredBy: { fontSize: 12, color: '#999' },
});

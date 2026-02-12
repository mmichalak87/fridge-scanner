import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PurchasesPackage } from 'react-native-purchases';
import { getOfferings, purchasePackage, restorePurchases, FREE_DAILY_SCANS } from '../src/services/subscription';

export default function PaywallScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: t('subscription.upgradeTitle'),
    });
  }, [i18n.language]);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    const availablePackages = await getOfferings(i18n.language);
    if (availablePackages) {
      setPackages(availablePackages);
      setSelectedPackage(availablePackages[0]);
    }
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    setPurchasing(true);
    const result = await purchasePackage(selectedPackage);
    setPurchasing(false);
    switch (result) {
      case 'success':
        Alert.alert('', t('subscription.purchaseSuccess'));
        router.back();
        break;
      case 'no_entitlement':
        Alert.alert('', t('subscription.purchaseNoEntitlement'));
        break;
      case 'failed':
        Alert.alert('', t('subscription.purchaseFailed'));
        break;
      case 'cancelled':
        // User cancelled - do nothing
        break;
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const success = await restorePurchases();
    setPurchasing(false);
    if (success) {
      Alert.alert('', t('subscription.restoreSuccess'));
      router.back();
    } else {
      Alert.alert('', t('subscription.restoreFailed'));
    }
  };

  const proFeatures = [
    { icon: 'scan' as const, text: t('subscription.featureUnlimitedScans') },
    { icon: 'heart' as const, text: t('subscription.featureMoreFavorites') },
    { icon: 'time' as const, text: t('subscription.featureMoreHistory') },
    { icon: 'star' as const, text: t('subscription.featurePriority') },
  ];

  const freeFeatures = [
    t('subscription.freeFeatureScans'),
    t('subscription.freeFeatureFavorites'),
    t('subscription.freeFeatureHistory'),
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.proIconContainer}>
          <Ionicons name="diamond" size={48} color="#FFD700" />
        </View>
        <Text style={styles.headerTitle}>{t('subscription.upgradeTitle')}</Text>
        <Text style={styles.headerSubtitle}>{t('subscription.upgradeSubtitle')}</Text>
      </LinearGradient>

      {/* Pro Features */}
      <View style={styles.featuresCard}>
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>PRO</Text>
        </View>
        {proFeatures.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <View style={styles.featureIconContainer}>
              <Ionicons name={feature.icon} size={20} color="#4CAF50" />
            </View>
            <Text style={styles.featureText}>{feature.text}</Text>
          </View>
        ))}
      </View>

      {/* Free vs Pro comparison */}
      <View style={styles.comparisonCard}>
        <View style={styles.comparisonHeader}>
          <Text style={styles.comparisonTitle}>{t('subscription.free')}</Text>
        </View>
        {freeFeatures.map((feature, index) => (
          <View key={index} style={styles.comparisonRow}>
            <Ionicons name="remove-circle-outline" size={18} color="#999" />
            <Text style={styles.comparisonText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Package selection */}
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <View style={styles.packagesContainer}>
          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.identifier}
              style={[
                styles.packageCard,
                selectedPackage?.identifier === pkg.identifier && styles.packageCardSelected,
              ]}
              onPress={() => setSelectedPackage(pkg)}
            >
              <View style={styles.packageInfo}>
                <Text style={[
                  styles.packageTitle,
                  selectedPackage?.identifier === pkg.identifier && styles.packageTitleSelected,
                ]}>
                  {pkg.product.title}
                </Text>
                <Text style={styles.packagePrice}>
                  {pkg.product.priceString}
                </Text>
              </View>
              <View style={[
                styles.packageRadio,
                selectedPackage?.identifier === pkg.identifier && styles.packageRadioSelected,
              ]} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Purchase button */}
      <TouchableOpacity
        style={[styles.purchaseButton, purchasing && styles.purchaseButtonDisabled]}
        onPress={handlePurchase}
        disabled={purchasing || !selectedPackage}
      >
        <LinearGradient
          colors={['#4CAF50', '#388E3C']}
          style={styles.purchaseGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="diamond" size={22} color="#FFD700" />
              <Text style={styles.purchaseText}>{t('subscription.subscribe')}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Restore */}
      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={purchasing}>
        <Text style={styles.restoreText}>{t('subscription.restore')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  proIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  featuresCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  planBadge: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  planBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  comparisonCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  comparisonHeader: {
    marginBottom: 12,
  },
  comparisonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  comparisonText: {
    fontSize: 15,
    color: '#999',
  },
  loader: {
    marginTop: 24,
  },
  packagesContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  packageCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  packageTitleSelected: {
    color: '#2E7D32',
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  packageRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  packageRadioSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  purchaseButton: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  purchaseText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  restoreText: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

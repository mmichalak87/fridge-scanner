import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRecentScans, getFavoriteRecipes, RecentScan } from '../src/services/storage';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    checkOnboarding();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const scans = await getRecentScans();
    const favorites = await getFavoriteRecipes();
    setRecentScans(scans);
    setFavoritesCount(favorites.length);
  };

  const checkOnboarding = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
      if (!onboardingComplete) {
        router.replace('/onboarding');
      } else {
        setIsLoading(false);
        loadData();
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
          style={styles.backgroundGradient}
        />
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/favorites')}
          >
            <Ionicons name="heart" size={22} color="#F44336" />
            {favoritesCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{favoritesCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.iconWrapper}>
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="fridge-outline" size={72} color="#fff" />
              </LinearGradient>
              <View style={styles.iconGlow} />
            </View>

            <Text style={styles.title}>{t('home.title')}</Text>
            <Text style={styles.subtitle}>{t('home.subtitle')}</Text>

            <View style={styles.features}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="scan" size={16} color="#4CAF50" />
                </View>
                <Text style={styles.featureText}>{t('home.featureScan')}</Text>
              </View>
              <View style={styles.featureDot} />
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="restaurant" size={16} color="#4CAF50" />
                </View>
                <Text style={styles.featureText}>{t('home.featureRecipes')}</Text>
              </View>
              <View style={styles.featureDot} />
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="swap-horizontal" size={16} color="#4CAF50" />
                </View>
                <Text style={styles.featureText}>{t('home.featureSubstitutes')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/camera')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#4CAF50', '#388E3C']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="camera" size={28} color="#fff" />
                <Text style={styles.primaryButtonText}>{t('home.scanButton')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/camera?gallery=true')}
              activeOpacity={0.85}
            >
              <Ionicons name="images" size={26} color="#4CAF50" />
              <Text style={styles.secondaryButtonText}>{t('home.galleryButton')}</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Scans */}
          {recentScans.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>{t('recentScans.title')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentList}
              >
                {recentScans.map((scan) => (
                  <TouchableOpacity
                    key={scan.id}
                    style={styles.recentCard}
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: '/results', params: { scanId: scan.id } })}
                  >
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${scan.imageBase64}` }}
                      style={styles.recentImage}
                      resizeMode="cover"
                    />
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentProducts}>
                        {scan.products.length} {t('recentScans.products')}
                      </Text>
                      <Text style={styles.recentDate}>{formatDate(scan.timestamp)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F44336',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  iconGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    top: -30,
    left: -30,
    zIndex: -1,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#43A047',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 28,
  },
  features: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#81C784',
    marginHorizontal: 8,
  },
  actions: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 14,
  },
  primaryButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 14,
  },
  primaryButtonText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  recentSection: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  recentList: {
    gap: 12,
  },
  recentCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recentImage: {
    width: '100%',
    height: 90,
  },
  recentInfo: {
    padding: 10,
  },
  recentProducts: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  recentDate: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
});

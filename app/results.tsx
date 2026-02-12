import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Easing, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { analyzeImage } from '../src/services/gemini';
import { ProductList } from '../src/components/ProductList';
import { RecipeCard } from '../src/components/RecipeCard';
import { Product, Recipe } from '../src/types';
import { saveRecentScan, saveFavoriteRecipe, removeFavoriteRecipe, getFavoriteRecipes, getRecentScanById } from '../src/services/storage';
import { useSubscription } from '../src/hooks/useSubscription';
import { FREE_DAILY_SCANS } from '../src/services/subscription';

function AnimatedLoader({ t }: { t: (key: string) => string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const scaleAnims = useRef([
    new Animated.Value(0.8),
    new Animated.Value(0.8),
    new Animated.Value(0.8),
  ]).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the icon
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Rotate animation for decorative element
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotate.start();

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 2500);

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 8000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    return () => {
      pulse.stop();
      rotate.stop();
      clearInterval(stepInterval);
    };
  }, []);

  useEffect(() => {
    // Animate current step
    fadeAnims.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim, {
          toValue: index <= currentStep ? 1 : 0.4,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[index], {
          toValue: index === currentStep ? 1.05 : 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [currentStep]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const steps = [
    { key: 'loadingStep1', icon: 'cloud-upload-outline' as const },
    { key: 'loadingStep2', icon: 'search-outline' as const },
    { key: 'loadingStep3', icon: 'restaurant-outline' as const },
  ];

  return (
    <LinearGradient
      colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
      style={styles.loadingContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative rotating circle */}
      <Animated.View
        style={[
          styles.decorativeCircle,
          { transform: [{ rotate: rotateInterpolate }] },
        ]}
      >
        <View style={styles.decorativeDot} />
        <View style={[styles.decorativeDot, styles.decorativeDot2]} />
        <View style={[styles.decorativeDot, styles.decorativeDot3]} />
      </Animated.View>

      <View style={styles.loadingContent}>
        {/* Animated Icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="fridge-outline" size={56} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Text style={styles.loadingTitle}>{t('results.analyzing')}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
        </View>

        {/* Animated Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <Animated.View
              key={step.key}
              style={[
                styles.stepItem,
                {
                  opacity: fadeAnims[index],
                  transform: [{ scale: scaleAnims[index] }],
                },
              ]}
            >
              <View
                style={[
                  styles.stepIconContainer,
                  index < currentStep && styles.stepCompleted,
                  index === currentStep && styles.stepActive,
                ]}
              >
                {index < currentStep ? (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                ) : (
                  <Ionicons
                    name={step.icon}
                    size={18}
                    color={index === currentStep ? '#fff' : '#81C784'}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepText,
                  index === currentStep && styles.stepTextActive,
                  index < currentStep && styles.stepTextCompleted,
                ]}
              >
                {t(`results.${step.key}`)}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* Animated dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: i === 0 ? [1, 0.3] : i === 1 ? [0.6, 1] : [0.3, 0.6],
                  }),
                },
              ]}
            />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

export default function ResultsScreen() {
  const { imageBase64, scanId } = useLocalSearchParams<{ imageBase64?: string; scanId?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const { isPro, canScan: checkCanScan, recordScan } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [completeRecipes, setCompleteRecipes] = useState<Recipe[]>([]);
  const [needMoreRecipes, setNeedMoreRecipes] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [currentImageBase64, setCurrentImageBase64] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: t('results.title'),
    });
  }, [i18n.language]);

  useEffect(() => {
    if (scanId) {
      loadSavedScan();
    } else if (imageBase64) {
      setCurrentImageBase64(imageBase64);
      performAnalysis();
    }
    loadFavorites();
  }, [imageBase64, scanId]);

  const loadFavorites = async () => {
    const favorites = await getFavoriteRecipes();
    setFavoriteIds(new Set(favorites.map(f => f.id)));
  };

  const loadSavedScan = async () => {
    setIsLoading(true);
    try {
      const scan = await getRecentScanById(scanId!);
      if (scan) {
        setCurrentImageBase64(scan.imageBase64);
        setProducts(scan.products);
        setCompleteRecipes(scan.completeRecipes || []);
        setNeedMoreRecipes(scan.needMoreRecipes || []);
      } else {
        setError(t('errors.analysisFailedMessage'));
      }
    } catch (err) {
      console.error('Failed to load saved scan:', err);
      setError(t('errors.analysisFailedMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  const performAnalysis = async () => {
    // Check scan limit before analyzing
    const allowed = await checkCanScan();
    if (!allowed) {
      setIsLoading(false);
      Alert.alert(
        t('subscription.scanLimitReached'),
        t('subscription.scanLimitMessage', { limit: FREE_DAILY_SCANS }),
        [
          { text: t('common.cancel'), onPress: () => router.back(), style: 'cancel' },
          { text: t('subscription.upgrade'), onPress: () => { router.back(); router.push('/paywall'); } },
        ]
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeImage(imageBase64!);
      setProducts(result.products);
      setCompleteRecipes(result.completeRecipes || []);
      setNeedMoreRecipes(result.needMoreRecipes || []);

      // Record the scan and save to recent scans
      await recordScan();
      await saveRecentScan(
        imageBase64!,
        result.products,
        result.completeRecipes || [],
        result.needMoreRecipes || [],
        isPro
      );
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : t('errors.analysisFailedMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (recipe: Recipe) => {
    const isFavorite = favoriteIds.has(recipe.id);

    if (isFavorite) {
      await removeFavoriteRecipe(recipe.id);
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipe.id);
        return newSet;
      });
      Alert.alert('', t('favorites.removed'));
    } else {
      const success = await saveFavoriteRecipe(recipe, isPro);
      if (success) {
        setFavoriteIds(prev => new Set(prev).add(recipe.id));
        Alert.alert('', t('favorites.added'));
      } else {
        Alert.alert('', t('favorites.maxReached'));
      }
    }
  };

  if (isLoading) {
    return <AnimatedLoader t={t} />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Text style={styles.errorEmoji}>{t('errors.analysisFailedEmoji')}</Text>
        </View>
        <Text style={styles.errorTitle}>{t('errors.analysisFailedTitle')}</Text>
        <Text style={styles.errorMessage}>{t('errors.analysisFailedMessage')}</Text>
        <View style={styles.errorActions}>
          {!scanId && (
            <TouchableOpacity style={styles.retryButton} onPress={performAnalysis}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {currentImageBase64 && (
        <View style={styles.imagePreview}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${currentImageBase64}` }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        </View>
      )}

      <ProductList products={products} />

      {/* Ready to Cook Section */}
      {completeRecipes.length > 0 && (
        <View style={styles.recipesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>{t('results.readyToCook')}</Text>
              <Text style={styles.sectionSubtitle}>{t('results.readyToCookSubtitle')}</Text>
            </View>
          </View>
          {completeRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favoriteIds.has(recipe.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </View>
      )}

      {/* Need More Ingredients Section */}
      {needMoreRecipes.length > 0 && (
        <View style={styles.recipesSection}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, styles.sectionIconOrange]}>
              <Ionicons name="basket" size={24} color="#FF9800" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>{t('results.needMore')}</Text>
              <Text style={styles.sectionSubtitle}>{t('results.needMoreSubtitle')}</Text>
            </View>
          </View>
          {needMoreRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favoriteIds.has(recipe.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </View>
      )}

      {/* No recipes fallback */}
      {completeRecipes.length === 0 && needMoreRecipes.length === 0 && (
        <View style={styles.recipesSection}>
          <Text style={styles.sectionTitle}>{t('results.recipes')}</Text>
          <View style={styles.noRecipes}>
            <Text style={styles.noRecipesText}>{t('results.noRecipes')}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.newScanButton}
        onPress={() => router.replace('/camera')}
      >
        <Ionicons name="camera" size={24} color="#fff" />
        <Text style={styles.newScanText}>{t('home.scanButton')}</Text>
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
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 40,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  decorativeDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.4)',
    top: -6,
    left: '50%',
    marginLeft: -6,
  },
  decorativeDot2: {
    top: '50%',
    left: -6,
    marginLeft: 0,
    marginTop: -6,
  },
  decorativeDot3: {
    top: '50%',
    left: 'auto',
    right: -6,
    marginLeft: 0,
    marginTop: -6,
  },
  iconContainer: {
    marginBottom: 28,
  },
  iconGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 24,
  },
  progressContainer: {
    width: 200,
    marginBottom: 32,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  stepsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#81C784',
  },
  stepActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepCompleted: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  stepText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  stepTextActive: {
    color: '#1B5E20',
    fontWeight: '600',
  },
  stepTextCompleted: {
    color: '#43A047',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  errorIconContainer: {
    marginBottom: 16,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorActions: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
  imagePreview: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  recipesSection: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionIconOrange: {
    backgroundColor: '#FFF3E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  noRecipes: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  noRecipesText: {
    fontSize: 16,
    color: '#888',
  },
  newScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 10,
  },
  newScanText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

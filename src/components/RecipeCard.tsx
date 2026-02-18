import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Recipe } from '../types';
import { SubstitutionBadge } from './SubstitutionBadge';
import { searchFoodImage } from '../services/pexels';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite?: boolean;
  onToggleFavorite?: (recipe: Recipe) => void;
}

const getGradientColors = (category?: string): string[] => {
  if (category === 'needMore') {
    return ['#FF9800', '#F57C00', '#E65100'];
  }
  return ['#4CAF50', '#388E3C', '#2E7D32'];
};

export function RecipeCard({ recipe, isFavorite = false, onToggleFavorite }: RecipeCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(recipe.imageUrl || null);
  const [imageError, setImageError] = useState(false);
  const heartScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (!imageUrl) {
      const query = recipe.imageSearchTerm || recipe.name;
      searchFoodImage(query).then(url => {
        if (url) setImageUrl(url);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe.imageSearchTerm, recipe.name]);

  const handleFavoritePress = () => {
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    onToggleFavorite?.(recipe);
  };

  const formatInstructions = (instructions: string) => {
    const steps = instructions.split(/(\d+\.\s)/).filter(Boolean);
    const formattedSteps: { number: string; text: string }[] = [];

    for (let i = 0; i < steps.length; i += 2) {
      if (steps[i].match(/^\d+\.\s?$/)) {
        formattedSteps.push({
          number: steps[i].trim(),
          text: steps[i + 1]?.trim() || '',
        });
      }
    }

    if (formattedSteps.length === 0) {
      return null;
    }

    return formattedSteps;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#888';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.9}
    >
      {/* Recipe Header */}
      <View style={styles.headerContainer}>
        {imageUrl && !imageError ? (
          <View style={styles.imageHeader}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.headerImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            />
            <View style={styles.imageTextContainer}>
              <Text style={styles.headerTitle}>{recipe.name}</Text>
              <View style={styles.headerBadges}>
                {recipe.prepTime && (
                  <View style={styles.headerBadge}>
                    <Ionicons name="time-outline" size={14} color="#fff" />
                    <Text style={styles.headerBadgeText}>{recipe.prepTime}</Text>
                  </View>
                )}
                {recipe.difficulty && (
                  <View
                    style={[
                      styles.headerBadge,
                      { backgroundColor: getDifficultyColor(recipe.difficulty) },
                    ]}
                  >
                    <Text style={styles.headerBadgeText}>
                      {t(`difficulty.${recipe.difficulty}`)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <LinearGradient
            colors={getGradientColors(recipe.category)}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.headerTitle}>{recipe.name}</Text>
            <View style={styles.headerBadges}>
              {recipe.prepTime && (
                <View style={styles.headerBadge}>
                  <Ionicons name="time-outline" size={14} color="#fff" />
                  <Text style={styles.headerBadgeText}>{recipe.prepTime}</Text>
                </View>
              )}
              {recipe.difficulty && (
                <View
                  style={[
                    styles.headerBadge,
                    { backgroundColor: getDifficultyColor(recipe.difficulty) },
                  ]}
                >
                  <Text style={styles.headerBadgeText}>{t(`difficulty.${recipe.difficulty}`)}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        )}

        {/* Favorite Button - always on top of header */}
        {onToggleFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#F44336' : 'rgba(255,255,255,0.8)'}
              />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      {/* Ingredients */}
      <View style={styles.content}>
        <View style={styles.ingredientsSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="food-variant" size={18} color="#4CAF50" />
            <Text style={styles.sectionTitle}>{t('results.ingredients')}</Text>
          </View>
          <View style={styles.ingredientsList}>
            {recipe.ingredients.slice(0, expanded ? undefined : 4).map((ing, idx) => {
              const isAvailable = recipe.availableIngredients?.includes(ing);
              return (
                <View
                  key={idx}
                  style={[
                    styles.ingredientChip,
                    isAvailable ? styles.availableChip : styles.missingChip,
                  ]}
                >
                  <Ionicons
                    name={isAvailable ? 'checkmark-circle' : 'add-circle-outline'}
                    size={14}
                    color={isAvailable ? '#1976D2' : '#F57C00'}
                    style={styles.chipIcon}
                  />
                  <Text
                    style={[
                      styles.ingredientText,
                      isAvailable ? styles.availableText : styles.missingText,
                    ]}
                  >
                    {ing}
                  </Text>
                </View>
              );
            })}
            {!expanded && recipe.ingredients.length > 4 && (
              <View style={styles.moreChip}>
                <Text style={styles.moreText}>+{recipe.ingredients.length - 4}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Alternative Recipes - Always visible when there are missing ingredients */}
        {recipe.alternatives && recipe.alternatives.length > 0 && (
          <View style={styles.alternativesSection}>
            <View style={styles.alternativesHeader}>
              <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.alternativesIconBg}>
                <Ionicons name="bulb" size={16} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={styles.alternativesTitle}>{t('alternatives.title')}</Text>
                <Text style={styles.alternativesSubtitle}>{t('alternatives.subtitle')}</Text>
              </View>
            </View>
            <View style={styles.alternativesList}>
              {recipe.alternatives.map((alt, idx) => (
                <View key={idx} style={styles.alternativeCard}>
                  <View style={styles.alternativeContent}>
                    <Text style={styles.alternativeName}>{alt.name}</Text>
                    <Text style={styles.alternativeDescription}>{alt.description}</Text>
                    <View style={styles.alternativeBadge}>
                      <Ionicons name="close-circle" size={12} color="#F57C00" />
                      <Text style={styles.alternativeBadgeText}>
                        {t('alternatives.noIngredient')} {alt.missingIngredient}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {expanded && (
          <>
            <View style={styles.instructions}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="chef-hat" size={18} color="#4CAF50" />
                <Text style={styles.sectionTitle}>{t('results.instructions')}</Text>
              </View>
              {formatInstructions(recipe.instructions) ? (
                <View style={styles.stepsList}>
                  {formatInstructions(recipe.instructions)!.map((step, idx) => (
                    <View key={idx} style={styles.stepItem}>
                      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{idx + 1}</Text>
                      </LinearGradient>
                      <Text style={styles.stepText}>{step.text}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.instructionsText}>{recipe.instructions}</Text>
              )}
            </View>

            {recipe.substitution && <SubstitutionBadge substitution={recipe.substitution} />}
          </>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.actionButton, expanded && styles.actionButtonExpanded]}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={expanded ? ['#F5F5F5', '#EEEEEE'] : ['#4CAF50', '#388E3C']}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons
              name={expanded ? 'chevron-up' : 'restaurant-outline'}
              size={20}
              color={expanded ? '#666' : '#fff'}
            />
            <Text style={[styles.actionButtonText, expanded && styles.actionButtonTextExpanded]}>
              {expanded ? t('common.back') : t('results.instructions')}
            </Text>
            {!expanded && <Ionicons name="chevron-down" size={18} color="#fff" />}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  headerContainer: {
    overflow: 'hidden',
  },
  imageHeader: {
    height: 180,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  imageTextContainer: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
  },
  headerGradient: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 20,
  },
  ingredientsSection: {
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipIcon: {
    marginRight: 6,
  },
  availableChip: {
    backgroundColor: '#E3F2FD',
  },
  missingChip: {
    backgroundColor: '#FFF3E0',
  },
  ingredientText: {
    fontSize: 13,
    fontWeight: '500',
  },
  availableText: {
    color: '#1976D2',
  },
  missingText: {
    color: '#F57C00',
  },
  moreChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  moreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  instructions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  instructionsText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  stepsList: {
    gap: 14,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    paddingTop: 4,
  },
  actionButton: {
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
    minHeight: 52,
  },
  actionButtonExpanded: {
    marginTop: 20,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonTextExpanded: {
    color: '#666',
  },
  alternativesSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  alternativesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  alternativesIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alternativesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  alternativesSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  alternativesList: {
    gap: 10,
  },
  alternativeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  alternativeContent: {
    flex: 1,
  },
  alternativeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  alternativeDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  alternativeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alternativeBadgeText: {
    fontSize: 11,
    color: '#F57C00',
    fontWeight: '500',
  },
});

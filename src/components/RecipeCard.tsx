import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Recipe } from '../types';
import { SubstitutionBadge } from './SubstitutionBadge';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite?: boolean;
  onToggleFavorite?: (recipe: Recipe) => void;
}

const getRecipeImage = (recipeName: string): string => {
  const name = recipeName.toLowerCase();

  // Map recipe types to Unsplash food images
  if (name.includes('egg') || name.includes('jaj')) {
    return 'https://images.unsplash.com/photo-1482049016gy-76a5e7b7b7b7?w=400&h=200&fit=crop';
  }
  if (name.includes('pasta') || name.includes('spaghetti') || name.includes('makaron')) {
    return 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=200&fit=crop';
  }
  if (name.includes('salad') || name.includes('sałat') || name.includes('salat')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=200&fit=crop';
  }
  if (name.includes('soup') || name.includes('zup')) {
    return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=200&fit=crop';
  }
  if (name.includes('sandwich') || name.includes('kanapk')) {
    return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=200&fit=crop';
  }
  if (name.includes('cake') || name.includes('ciast') || name.includes('dessert') || name.includes('deser')) {
    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=200&fit=crop';
  }
  if (name.includes('chicken') || name.includes('kurczak')) {
    return 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=200&fit=crop';
  }
  if (name.includes('potato') || name.includes('ziemniak') || name.includes('dumpling') || name.includes('kluski')) {
    return 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=400&h=200&fit=crop';
  }
  if (name.includes('plum') || name.includes('śliwk') || name.includes('fruit') || name.includes('owoc')) {
    return 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=200&fit=crop';
  }

  // Default food image
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=200&fit=crop';
};

const getRecipeIcon = (recipeName: string): string => {
  const name = recipeName.toLowerCase();

  if (name.includes('egg') || name.includes('jaj')) return 'egg-fried';
  if (name.includes('pasta') || name.includes('makaron')) return 'pasta';
  if (name.includes('salad') || name.includes('sałat')) return 'food-apple';
  if (name.includes('soup') || name.includes('zup')) return 'bowl-mix';
  if (name.includes('sandwich') || name.includes('kanapk')) return 'bread-slice';
  if (name.includes('cake') || name.includes('ciast') || name.includes('dessert')) return 'cupcake';
  if (name.includes('chicken') || name.includes('kurczak')) return 'food-drumstick';
  if (name.includes('potato') || name.includes('dumpling') || name.includes('kluski')) return 'food';
  if (name.includes('plum') || name.includes('fruit') || name.includes('caramel')) return 'fruit-cherries';

  return 'silverware-fork-knife';
};

export function RecipeCard({ recipe, isFavorite = false, onToggleFavorite }: RecipeCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const heartScale = useState(new Animated.Value(1))[0];

  const handleFavoritePress = () => {
    // Animate the heart
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

  const recipeIcon = getRecipeIcon(recipe.name);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.9}
    >
      {/* Recipe Image */}
      <View style={styles.imageContainer}>
        {!imageError ? (
          <Image
            source={{ uri: getRecipeImage(recipe.name) }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <LinearGradient
            colors={['#66BB6A', '#43A047', '#2E7D32']}
            style={styles.imagePlaceholder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name={recipeIcon as any} size={48} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        )}

        {/* Favorite Button */}
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
                color={isFavorite ? '#F44336' : '#fff'}
              />
            </Animated.View>
          </TouchableOpacity>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        >
          <Text style={styles.imageTitle}>{recipe.name}</Text>
          <View style={styles.imageBadges}>
            {recipe.prepTime && (
              <View style={styles.imageBadge}>
                <Ionicons name="time-outline" size={14} color="#fff" />
                <Text style={styles.imageBadgeText}>{recipe.prepTime}</Text>
              </View>
            )}
            {recipe.difficulty && (
              <View style={[styles.imageBadge, { backgroundColor: getDifficultyColor(recipe.difficulty) }]}>
                <Text style={styles.imageBadgeText}>{t(`difficulty.${recipe.difficulty}`)}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
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
                    name={isAvailable ? 'checkmark-circle' : 'alert-circle'}
                    size={14}
                    color={isAvailable ? '#2E7D32' : '#C62828'}
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
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.alternativesIconBg}
              >
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
                  <View style={styles.alternativeIcon}>
                    <MaterialCommunityIcons
                      name={getRecipeIcon(alt.name) as any}
                      size={24}
                      color="#FF9800"
                    />
                  </View>
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
                      <LinearGradient
                        colors={['#4CAF50', '#2E7D32']}
                        style={styles.stepNumber}
                      >
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

            {recipe.substitution && (
              <SubstitutionBadge substitution={recipe.substitution} />
            )}
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
            {!expanded && (
              <Ionicons name="chevron-down" size={18} color="#fff" />
            )}
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
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 40,
  },
  imageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  imageBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  imageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 16,
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
    backgroundColor: '#E8F5E9',
  },
  missingChip: {
    backgroundColor: '#FFEBEE',
  },
  ingredientText: {
    fontSize: 13,
    fontWeight: '500',
  },
  availableText: {
    color: '#2E7D32',
  },
  missingText: {
    color: '#C62828',
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
  },
  actionButtonExpanded: {
    marginTop: 20,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
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
  alternativeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
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

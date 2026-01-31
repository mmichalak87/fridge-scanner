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

  // Eggs - EN, PL, UK, DE
  if (name.includes('egg') || name.includes('jaj') || name.includes('яйц') || name.includes('яєч') || name.includes('eier') || name.includes('omlet') || name.includes('омлет') || name.includes('scrambl')) {
    return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=200&fit=crop';
  }
  // Pasta - EN, PL, UK, DE
  if (name.includes('pasta') || name.includes('spaghetti') || name.includes('makaron') || name.includes('паста') || name.includes('макарон') || name.includes('nudel') || name.includes('lasagn') || name.includes('лазань') || name.includes('carbonara') || name.includes('bolognese') || name.includes('penne') || name.includes('tagliatelle')) {
    return 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=200&fit=crop';
  }
  // Salad - EN, PL, UK, DE
  if (name.includes('salad') || name.includes('sałat') || name.includes('салат') || name.includes('salat')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=200&fit=crop';
  }
  // Soup - EN, PL, UK, DE
  if (name.includes('soup') || name.includes('zup') || name.includes('суп') || name.includes('борщ') || name.includes('borscht') || name.includes('suppe') || name.includes('rosół') || name.includes('broth') || name.includes('бульйон')) {
    return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=200&fit=crop';
  }
  // Sandwich/Toast - EN, PL, UK, DE
  if (name.includes('sandwich') || name.includes('kanapk') || name.includes('бутерброд') || name.includes('сендвіч') || name.includes('toast') || name.includes('tost') || name.includes('гренк') || name.includes('belegtes')) {
    return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=200&fit=crop';
  }
  // Pizza
  if (name.includes('pizza') || name.includes('піца') || name.includes('пицц')) {
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=200&fit=crop';
  }
  // Cake/Dessert - EN, PL, UK, DE
  if (name.includes('cake') || name.includes('ciast') || name.includes('торт') || name.includes('kuchen') || name.includes('dessert') || name.includes('deser') || name.includes('десерт') || name.includes('nachtisch') || name.includes('sernik') || name.includes('cheesecake') || name.includes('чізкейк')) {
    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=200&fit=crop';
  }
  // Pancakes - EN, PL, UK, DE
  if (name.includes('pancake') || name.includes('naleśnik') || name.includes('mlynci') || name.includes('млинц') || name.includes('pfannkuchen') || name.includes('crepe') || name.includes('racuch') || name.includes('оладк')) {
    return 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=200&fit=crop';
  }
  // Chicken - EN, PL, UK, DE
  if (name.includes('chicken') || name.includes('kurczak') || name.includes('kura') || name.includes('курк') || name.includes('курят') || name.includes('huhn') || name.includes('hähnchen') || name.includes('hühn')) {
    return 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=200&fit=crop';
  }
  // Fish - EN, PL, UK, DE
  if (name.includes('fish') || name.includes('ryb') || name.includes('риб') || name.includes('fisch') || name.includes('salmon') || name.includes('łosoś') || name.includes('лосось') || name.includes('lachs') || name.includes('tuna') || name.includes('tuńczyk') || name.includes('thunfisch')) {
    return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=200&fit=crop';
  }
  // Meat/Beef - EN, PL, UK, DE
  if (name.includes('beef') || name.includes('wołowin') || name.includes('яловичин') || name.includes('rind') || name.includes('steak') || name.includes('stek') || name.includes('стейк') || name.includes('mięs') || name.includes("м'яс") || name.includes('fleisch') || name.includes('kotlet') || name.includes('schnitzel')) {
    return 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&h=200&fit=crop';
  }
  // Pork - EN, PL, UK, DE
  if (name.includes('pork') || name.includes('wieprz') || name.includes('свинин') || name.includes('schwein') || name.includes('schabowy') || name.includes('bacon') || name.includes('boczek') || name.includes('бекон') || name.includes('speck')) {
    return 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=200&fit=crop';
  }
  // Potato/Dumplings - EN, PL, UK, DE
  if (name.includes('potato') || name.includes('ziemniak') || name.includes('картопл') || name.includes('kartoffel') || name.includes('dumpling') || name.includes('kluski') || name.includes('vareniki') || name.includes('вареник') || name.includes('pierogi') || name.includes('пироги') || name.includes('knödel') || name.includes('pyzy') || name.includes('kopytk')) {
    return 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=400&h=200&fit=crop';
  }
  // Rice - EN, PL, UK, DE
  if (name.includes('rice') || name.includes('ryż') || name.includes('рис') || name.includes('reis') || name.includes('risotto') || name.includes('ризото') || name.includes('pilaf') || name.includes('pilau') || name.includes('плов')) {
    return 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=200&fit=crop';
  }
  // Vegetables - EN, PL, UK, DE
  if (name.includes('vegetable') || name.includes('warzyw') || name.includes('овоч') || name.includes('gemüse') || name.includes('vegan') || name.includes('veggie')) {
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=200&fit=crop';
  }
  // Smoothie/Drink - EN, PL, UK, DE
  if (name.includes('smoothie') || name.includes('koktajl') || name.includes('смузі') || name.includes('shake') || name.includes('drink') || name.includes('getränk') || name.includes('napój') || name.includes('напій')) {
    return 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=200&fit=crop';
  }
  // Bread - EN, PL, UK, DE
  if (name.includes('bread') || name.includes('chleb') || name.includes('хліб') || name.includes('brot') || name.includes('bułk') || name.includes('булк') || name.includes('brötchen')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=200&fit=crop';
  }
  // Fruit/Plum - EN, PL, UK, DE
  if (name.includes('plum') || name.includes('śliwk') || name.includes('слив') || name.includes('pflaume') || name.includes('fruit') || name.includes('owoc') || name.includes('фрукт') || name.includes('obst') || name.includes('apple') || name.includes('jabłk') || name.includes('яблук') || name.includes('apfel')) {
    return 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=200&fit=crop';
  }
  // Stir-fry/Wok - EN, PL, UK, DE
  if (name.includes('stir') || name.includes('wok') || name.includes('asian') || name.includes('azjat') || name.includes('азіат') || name.includes('asiat') || name.includes('chiński') || name.includes('chinese') || name.includes('chines')) {
    return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=200&fit=crop';
  }
  // Burger - EN, PL, UK, DE
  if (name.includes('burger') || name.includes('hamburger') || name.includes('бургер')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=200&fit=crop';
  }
  // Wrap/Burrito/Taco
  if (name.includes('wrap') || name.includes('burrito') || name.includes('taco') || name.includes('тако') || name.includes('tortilla') || name.includes('тортилья')) {
    return 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=200&fit=crop';
  }
  // Breakfast - EN, PL, UK, DE
  if (name.includes('breakfast') || name.includes('śniadani') || name.includes('сніданок') || name.includes('frühstück')) {
    return 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=200&fit=crop';
  }
  // Cheese - EN, PL, UK, DE
  if (name.includes('cheese') || name.includes('ser ') || name.includes('serow') || name.includes('сир') || name.includes('käse') || name.includes('zapiekank')) {
    return 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=200&fit=crop';
  }

  // Default food image
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=200&fit=crop';
};

const getRecipeIcon = (recipeName: string): string => {
  const name = recipeName.toLowerCase();

  // Eggs
  if (name.includes('egg') || name.includes('jaj') || name.includes('яйц') || name.includes('яєч') || name.includes('eier') || name.includes('omlet') || name.includes('омлет')) return 'egg-fried';
  // Pasta
  if (name.includes('pasta') || name.includes('makaron') || name.includes('паста') || name.includes('макарон') || name.includes('nudel') || name.includes('spaghetti') || name.includes('lasagn')) return 'pasta';
  // Salad
  if (name.includes('salad') || name.includes('sałat') || name.includes('салат') || name.includes('salat')) return 'food-apple';
  // Soup
  if (name.includes('soup') || name.includes('zup') || name.includes('суп') || name.includes('борщ') || name.includes('suppe') || name.includes('rosół') || name.includes('broth')) return 'bowl-mix';
  // Sandwich
  if (name.includes('sandwich') || name.includes('kanapk') || name.includes('бутерброд') || name.includes('сендвіч') || name.includes('toast') || name.includes('tost')) return 'bread-slice';
  // Pizza
  if (name.includes('pizza') || name.includes('піца') || name.includes('пицц')) return 'pizza';
  // Cake/Dessert
  if (name.includes('cake') || name.includes('ciast') || name.includes('торт') || name.includes('kuchen') || name.includes('dessert') || name.includes('deser') || name.includes('десерт')) return 'cupcake';
  // Pancakes
  if (name.includes('pancake') || name.includes('naleśnik') || name.includes('млинц') || name.includes('pfannkuchen') || name.includes('crepe') || name.includes('оладк')) return 'circle-outline';
  // Chicken
  if (name.includes('chicken') || name.includes('kurczak') || name.includes('курк') || name.includes('курят') || name.includes('huhn') || name.includes('hähnchen')) return 'food-drumstick';
  // Fish
  if (name.includes('fish') || name.includes('ryb') || name.includes('риб') || name.includes('fisch') || name.includes('salmon') || name.includes('łosoś') || name.includes('лосось')) return 'fish';
  // Meat/Beef
  if (name.includes('beef') || name.includes('wołowin') || name.includes('яловичин') || name.includes('steak') || name.includes('stek') || name.includes('стейк') || name.includes('mięs') || name.includes("м'яс") || name.includes('kotlet')) return 'food-steak';
  // Pork
  if (name.includes('pork') || name.includes('wieprz') || name.includes('свинин') || name.includes('schwein') || name.includes('bacon') || name.includes('boczek') || name.includes('бекон')) return 'pig-variant';
  // Potato/Dumplings
  if (name.includes('potato') || name.includes('ziemniak') || name.includes('картопл') || name.includes('dumpling') || name.includes('kluski') || name.includes('вареник') || name.includes('pierogi')) return 'food';
  // Rice
  if (name.includes('rice') || name.includes('ryż') || name.includes('рис') || name.includes('reis') || name.includes('risotto')) return 'rice';
  // Vegetables
  if (name.includes('vegetable') || name.includes('warzyw') || name.includes('овоч') || name.includes('gemüse') || name.includes('vegan')) return 'leaf';
  // Smoothie/Drink
  if (name.includes('smoothie') || name.includes('koktajl') || name.includes('смузі') || name.includes('shake') || name.includes('drink')) return 'cup';
  // Bread
  if (name.includes('bread') || name.includes('chleb') || name.includes('хліб') || name.includes('brot') || name.includes('bułk')) return 'baguette';
  // Fruit
  if (name.includes('plum') || name.includes('śliwk') || name.includes('слив') || name.includes('fruit') || name.includes('owoc') || name.includes('фрукт') || name.includes('apple') || name.includes('jabłk')) return 'fruit-cherries';
  // Stir-fry/Asian
  if (name.includes('stir') || name.includes('wok') || name.includes('asian') || name.includes('chinese') || name.includes('chiński')) return 'noodles';
  // Burger
  if (name.includes('burger') || name.includes('hamburger') || name.includes('бургер')) return 'hamburger';
  // Wrap/Taco
  if (name.includes('wrap') || name.includes('burrito') || name.includes('taco') || name.includes('тако') || name.includes('tortilla')) return 'taco';
  // Breakfast
  if (name.includes('breakfast') || name.includes('śniadani') || name.includes('сніданок') || name.includes('frühstück')) return 'coffee';
  // Cheese
  if (name.includes('cheese') || name.includes('ser ') || name.includes('serow') || name.includes('сир') || name.includes('käse')) return 'cheese';

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

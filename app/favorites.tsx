import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RecipeCard } from '../src/components/RecipeCard';
import { getFavoriteRecipes, removeFavoriteRecipe, FavoriteRecipe } from '../src/services/storage';
import { Recipe } from '../src/types';

export default function FavoritesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);

  useEffect(() => {
    navigation.setOptions({
      title: t('favorites.title'),
    });
  }, [i18n.language]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const data = await getFavoriteRecipes();
    setFavorites(data);
  };

  const handleToggleFavorite = async (recipe: Recipe) => {
    await removeFavoriteRecipe(recipe.id);
    setFavorites(prev => prev.filter(f => f.id !== recipe.id));
    Alert.alert('', t('favorites.removed'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {favorites.length > 0 ? (
          favorites.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={true}
              onToggleFavorite={handleToggleFavorite}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#FFEBEE', '#FFCDD2']}
              style={styles.emptyIcon}
            >
              <Ionicons name="heart-outline" size={48} color="#F44336" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>{t('favorites.empty')}</Text>
            <Text style={styles.emptyHint}>{t('favorites.emptyHint')}</Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => router.push('/camera')}
            >
              <LinearGradient
                colors={['#4CAF50', '#388E3C']}
                style={styles.scanButtonGradient}
              >
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.scanButtonText}>{t('home.scanButton')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
    marginBottom: 32,
  },
  scanButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 10,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

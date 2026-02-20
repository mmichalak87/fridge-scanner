import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { RecipeCard } from '../components/RecipeCard';
import { getFavoriteRecipes, removeFavoriteRecipe, FavoriteRecipe } from '../services/storage';
import { Recipe } from '../types';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;

export default function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t, i18n } = useTranslation();
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);

  useEffect(() => {
    navigation.setOptions({
      title: t('favorites.title'),
    });
  }, [navigation, t, i18n.language]);

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
      <ScrollView
        contentContainerStyle={[styles.content, favorites.length === 0 && styles.contentEmpty]}
      >
        {favorites.length > 0 ? (
          favorites.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={true}
              onToggleFavorite={handleToggleFavorite}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <LinearGradient colors={['#FFEBEE', '#FFCDD2']} style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={48} color="#F44336" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>{t('favorites.empty')}</Text>
            <Text style={styles.emptyHint}>{t('favorites.emptyHint')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  contentEmpty: { flexGrow: 1, justifyContent: 'center' },
  emptyContainer: { alignItems: 'center' },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  emptyHint: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});

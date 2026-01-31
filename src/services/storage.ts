import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, Product } from '../types';

const RECENT_SCANS_KEY = 'recent_scans';
const FAVORITE_RECIPES_KEY = 'favorite_recipes';
const MAX_RECENT_SCANS = 5;
const MAX_FAVORITES = 5;

export interface RecentScan {
  id: string;
  imageBase64: string;
  products: Product[];
  completeRecipes: Recipe[];
  needMoreRecipes: Recipe[];
  timestamp: number;
}

export interface FavoriteRecipe extends Recipe {
  savedAt: number;
}

// Recent Scans
export async function saveRecentScan(
  imageBase64: string,
  products: Product[],
  completeRecipes: Recipe[],
  needMoreRecipes: Recipe[]
): Promise<void> {
  try {
    const scans = await getRecentScans();

    const newScan: RecentScan = {
      id: Date.now().toString(),
      imageBase64,
      products,
      completeRecipes,
      needMoreRecipes,
      timestamp: Date.now(),
    };

    // Add new scan at the beginning and keep only MAX_RECENT_SCANS
    const updatedScans = [newScan, ...scans].slice(0, MAX_RECENT_SCANS);

    await AsyncStorage.setItem(RECENT_SCANS_KEY, JSON.stringify(updatedScans));
  } catch (error) {
    console.error('Error saving recent scan:', error);
  }
}

export async function getRecentScans(): Promise<RecentScan[]> {
  try {
    const data = await AsyncStorage.getItem(RECENT_SCANS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting recent scans:', error);
    return [];
  }
}

export async function deleteRecentScan(id: string): Promise<void> {
  try {
    const scans = await getRecentScans();
    const updatedScans = scans.filter(scan => scan.id !== id);
    await AsyncStorage.setItem(RECENT_SCANS_KEY, JSON.stringify(updatedScans));
  } catch (error) {
    console.error('Error deleting recent scan:', error);
  }
}

export async function getRecentScanById(id: string): Promise<RecentScan | null> {
  try {
    const scans = await getRecentScans();
    return scans.find(scan => scan.id === id) || null;
  } catch (error) {
    console.error('Error getting scan by id:', error);
    return null;
  }
}

// Favorite Recipes
export async function saveFavoriteRecipe(recipe: Recipe): Promise<boolean> {
  try {
    const favorites = await getFavoriteRecipes();

    // Check if already exists
    if (favorites.some(fav => fav.id === recipe.id)) {
      return true;
    }

    // Check if max reached
    if (favorites.length >= MAX_FAVORITES) {
      return false;
    }

    const favoriteRecipe: FavoriteRecipe = {
      ...recipe,
      savedAt: Date.now(),
    };

    const updatedFavorites = [favoriteRecipe, ...favorites];
    await AsyncStorage.setItem(FAVORITE_RECIPES_KEY, JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Error saving favorite recipe:', error);
    return false;
  }
}

export async function removeFavoriteRecipe(recipeId: string): Promise<void> {
  try {
    const favorites = await getFavoriteRecipes();
    const updatedFavorites = favorites.filter(fav => fav.id !== recipeId);
    await AsyncStorage.setItem(FAVORITE_RECIPES_KEY, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error removing favorite recipe:', error);
  }
}

export async function getFavoriteRecipes(): Promise<FavoriteRecipe[]> {
  try {
    const data = await AsyncStorage.getItem(FAVORITE_RECIPES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favorite recipes:', error);
    return [];
  }
}

export async function isRecipeFavorite(recipeId: string): Promise<boolean> {
  try {
    const favorites = await getFavoriteRecipes();
    return favorites.some(fav => fav.id === recipeId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}

export async function getFavoritesCount(): Promise<number> {
  const favorites = await getFavoriteRecipes();
  return favorites.length;
}

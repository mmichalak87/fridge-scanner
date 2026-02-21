import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, Product } from '../types';
import { getMaxFavorites, getMaxRecentScans } from './subscription';
import i18n from '../locales/i18n';

const RECENT_SCANS_KEY = 'recent_scans';
const FAVORITE_RECIPES_KEY = 'favorite_recipes';

export interface RecentScan {
  id: string;
  imageBase64: string;
  products: Product[];
  completeRecipes: Recipe[];
  needMoreRecipes: Recipe[];
  timestamp: number;
  language?: string;
}

export interface FavoriteRecipe extends Recipe {
  savedAt: number;
  language?: string;
}

// Recent Scans
export async function saveRecentScan(
  imageBase64: string,
  products: Product[],
  completeRecipes: Recipe[],
  needMoreRecipes: Recipe[],
  isPro: boolean = false
): Promise<void> {
  try {
    const scans = await getAllRecentScans();
    const maxScans = getMaxRecentScans(isPro);

    const newScan: RecentScan = {
      id: Date.now().toString(),
      imageBase64,
      products,
      completeRecipes,
      needMoreRecipes,
      timestamp: Date.now(),
      language: i18n.language,
    };

    const updatedScans = [newScan, ...scans].slice(0, maxScans);

    await AsyncStorage.setItem(RECENT_SCANS_KEY, JSON.stringify(updatedScans));
  } catch (error) {
    console.error('Error saving recent scan:', error);
  }
}

// Get all scans (unfiltered, for internal use)
async function getAllRecentScans(): Promise<RecentScan[]> {
  try {
    const data = await AsyncStorage.getItem(RECENT_SCANS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting recent scans:', error);
    return [];
  }
}

// Get scans filtered by current language
export async function getRecentScans(): Promise<RecentScan[]> {
  const scans = await getAllRecentScans();
  const currentLang = i18n.language;
  return scans.filter(scan => !scan.language || scan.language === currentLang);
}

export async function deleteRecentScan(id: string): Promise<void> {
  try {
    const scans = await getAllRecentScans();
    const updatedScans = scans.filter(scan => scan.id !== id);
    await AsyncStorage.setItem(RECENT_SCANS_KEY, JSON.stringify(updatedScans));
  } catch (error) {
    console.error('Error deleting recent scan:', error);
  }
}

export async function getRecentScanById(id: string): Promise<RecentScan | null> {
  try {
    const scans = await getAllRecentScans();
    return scans.find(scan => scan.id === id) || null;
  } catch (error) {
    console.error('Error getting scan by id:', error);
    return null;
  }
}

// Favorite Recipes
export async function saveFavoriteRecipe(recipe: Recipe, isPro: boolean = false): Promise<boolean> {
  try {
    const favorites = await getAllFavoriteRecipes();
    const maxFavorites = getMaxFavorites(isPro);

    // Check if already exists
    if (favorites.some(fav => fav.id === recipe.id)) {
      return true;
    }

    // Check if max reached
    if (favorites.length >= maxFavorites) {
      return false;
    }

    const favoriteRecipe: FavoriteRecipe = {
      ...recipe,
      savedAt: Date.now(),
      language: i18n.language,
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
    const favorites = await getAllFavoriteRecipes();
    const updatedFavorites = favorites.filter(fav => fav.id !== recipeId);
    await AsyncStorage.setItem(FAVORITE_RECIPES_KEY, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error removing favorite recipe:', error);
  }
}

// Get all favorites (unfiltered, for internal use)
async function getAllFavoriteRecipes(): Promise<FavoriteRecipe[]> {
  try {
    const data = await AsyncStorage.getItem(FAVORITE_RECIPES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favorite recipes:', error);
    return [];
  }
}

// Get favorites filtered by current language
export async function getFavoriteRecipes(): Promise<FavoriteRecipe[]> {
  const favorites = await getAllFavoriteRecipes();
  const currentLang = i18n.language;
  return favorites.filter(fav => !fav.language || fav.language === currentLang);
}

export async function isRecipeFavorite(recipeId: string): Promise<boolean> {
  try {
    const favorites = await getAllFavoriteRecipes();
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

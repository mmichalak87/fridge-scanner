import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveRecentScan,
  getRecentScans,
  deleteRecentScan,
  getRecentScanById,
  saveFavoriteRecipe,
  removeFavoriteRecipe,
  getFavoriteRecipes,
  isRecipeFavorite,
  getFavoritesCount,
} from '../storage';
import { Recipe, Product } from '../../types';

jest.mock('@react-native-async-storage/async-storage');

describe('Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Recent Scans', () => {
    const mockProducts: Product[] = [
      { id: '1', name: 'Apple' },
      { id: '2', name: 'Banana' },
    ];

    const mockRecipes: Recipe[] = [
      {
        id: '1',
        name: 'Test Recipe',
        ingredients: ['Apple', 'Banana'],
        availableIngredients: ['Apple', 'Banana'],
        missingIngredients: [],
        instructions: 'Mix and cook',
        prepTime: '30 min',
        difficulty: 'easy',
      },
    ];

    it('should save a recent scan', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await saveRecentScan('base64image', mockProducts, mockRecipes, [], false);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'recent_scans',
        expect.stringContaining('base64image')
      );
    });

    it('should respect max scans limit for free users', async () => {
      const existingScans = Array.from({ length: 5 }, (_, i) => ({
        id: `scan-${i}`,
        imageBase64: 'img',
        products: [],
        completeRecipes: [],
        needMoreRecipes: [],
        timestamp: Date.now() - i * 1000,
      }));

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingScans));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await saveRecentScan('newimage', mockProducts, mockRecipes, [], false);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const savedScans = JSON.parse(savedData);

      expect(savedScans).toHaveLength(5); // FREE_MAX_RECENT_SCANS
      expect(savedScans[0].imageBase64).toBe('newimage');
    });

    it('should get recent scans', async () => {
      const mockScans = [
        {
          id: '1',
          imageBase64: 'img1',
          products: mockProducts,
          completeRecipes: mockRecipes,
          needMoreRecipes: [],
          timestamp: Date.now(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockScans));

      const scans = await getRecentScans();

      expect(scans).toEqual(mockScans);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('recent_scans');
    });

    it('should delete a recent scan by id', async () => {
      const mockScans = [
        { id: '1', imageBase64: 'img1', products: [], completeRecipes: [], needMoreRecipes: [], timestamp: Date.now() },
        { id: '2', imageBase64: 'img2', products: [], completeRecipes: [], needMoreRecipes: [], timestamp: Date.now() },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockScans));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await deleteRecentScan('1');

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const updatedScans = JSON.parse(savedData);

      expect(updatedScans).toHaveLength(1);
      expect(updatedScans[0].id).toBe('2');
    });

    it('should get scan by id', async () => {
      const mockScan = {
        id: 'test-id',
        imageBase64: 'img',
        products: mockProducts,
        completeRecipes: mockRecipes,
        needMoreRecipes: [],
        timestamp: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([mockScan]));

      const scan = await getRecentScanById('test-id');

      expect(scan).toEqual(mockScan);
    });
  });

  describe('Favorite Recipes', () => {
    const mockRecipe: Recipe = {
      id: 'recipe-1',
      name: 'Test Recipe',
      ingredients: ['Apple', 'Banana'],
      availableIngredients: ['Apple', 'Banana'],
      missingIngredients: [],
      instructions: 'Mix and cook',
      prepTime: '30 min',
      difficulty: 'easy',
    };

    it('should save a favorite recipe', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await saveFavoriteRecipe(mockRecipe, false);

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'favorite_recipes',
        expect.stringContaining('recipe-1')
      );
    });

    it('should not save duplicate favorite', async () => {
      const existingFavorites = [{
        ...mockRecipe,
        savedAt: Date.now(),
      }];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingFavorites));

      const result = await saveFavoriteRecipe(mockRecipe, false);

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should respect max favorites limit for free users', async () => {
      const existingFavorites = Array.from({ length: 5 }, (_, i) => ({
        ...mockRecipe,
        id: `recipe-${i}`,
        savedAt: Date.now(),
      }));

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingFavorites));

      const newRecipe = { ...mockRecipe, id: 'new-recipe' };
      const result = await saveFavoriteRecipe(newRecipe, false);

      expect(result).toBe(false);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should remove a favorite recipe', async () => {
      const favorites = [
        { ...mockRecipe, id: '1', savedAt: Date.now() },
        { ...mockRecipe, id: '2', savedAt: Date.now() },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(favorites));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await removeFavoriteRecipe('1');

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const updatedFavorites = JSON.parse(savedData);

      expect(updatedFavorites).toHaveLength(1);
      expect(updatedFavorites[0].id).toBe('2');
    });

    it('should check if recipe is favorite', async () => {
      const favorites = [{ ...mockRecipe, savedAt: Date.now() }];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(favorites));

      const isFavorite = await isRecipeFavorite('recipe-1');

      expect(isFavorite).toBe(true);
    });

    it('should get favorites count', async () => {
      const favorites = [
        { ...mockRecipe, id: '1', savedAt: Date.now() },
        { ...mockRecipe, id: '2', savedAt: Date.now() },
        { ...mockRecipe, id: '3', savedAt: Date.now() },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(favorites));

      const count = await getFavoritesCount();

      expect(count).toBe(3);
    });
  });
});

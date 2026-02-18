// Set API key BEFORE any imports
process.env.GEMINI_API_KEY = 'test-api-key';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  GEMINI_API_KEY: 'test-api-key',
}));

// Mock i18n before importing gemini
jest.mock('../../locales/i18n', () => ({
  language: 'en',
}));

// Mock the module
jest.mock('@google/generative-ai');

// Import gemini service
import { analyzeImage, getRecipeSuggestions } from '../gemini';

// Import the mock function from our manual mock
const { mockGenerateContent } = require('../../__mocks__/@google/generative-ai');

describe('Gemini Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeImage', () => {
    const mockBase64Image = 'base64encodedimage';

    it('should successfully analyze image and return products and recipes', async () => {
      const mockResponse = {
        products: [
          { id: '1', name: 'Milk', confidence: 0.95 },
          { id: '2', name: 'Eggs', confidence: 0.92 },
        ],
        completeRecipes: [
          {
            id: '1',
            name: 'Scrambled Eggs',
            ingredients: ['2 eggs', '50ml milk', 'salt', 'pepper'],
            availableIngredients: ['eggs', 'milk', 'salt', 'pepper'],
            missingIngredients: [],
            instructions: '1. Beat eggs with milk...',
            prepTime: '10 min',
            difficulty: 'easy',
          },
        ],
        needMoreRecipes: [
          {
            id: '2',
            name: 'French Toast',
            ingredients: ['2 eggs', '100ml milk', '2 slices bread'],
            availableIngredients: ['eggs', 'milk'],
            missingIngredients: ['bread'],
            substitution: null,
            alternatives: [],
            instructions: '1. Whisk eggs and milk...',
            prepTime: '15 min',
            difficulty: 'easy',
          },
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });

      const result = await analyzeImage(mockBase64Image);

      expect(result.products).toEqual(mockResponse.products);
      expect(result.recipes.length).toBe(2);
      expect(result.completeRecipes).toBeDefined();
      expect(result.needMoreRecipes).toBeDefined();
      expect(result.completeRecipes!.length).toBe(1);
      expect(result.needMoreRecipes!.length).toBe(1);
      expect(result.completeRecipes![0].category).toBe('complete');
      expect(result.needMoreRecipes![0].category).toBe('needMore');
    });

    it('should handle JSON parsing errors', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'This is not valid JSON',
        },
      });

      await expect(analyzeImage(mockBase64Image)).rejects.toThrow('ANALYSIS_FAILED');
    });

    it('should handle API errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(analyzeImage(mockBase64Image)).rejects.toThrow('ANALYSIS_FAILED');
    });

    it('should handle response with extra text around JSON', async () => {
      const mockResponse = {
        products: [{ id: '1', name: 'Apple', confidence: 0.9 }],
        completeRecipes: [],
        needMoreRecipes: [],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => `Here is the analysis:\n${JSON.stringify(mockResponse)}\nEnd of analysis`,
        },
      });

      const result = await analyzeImage(mockBase64Image);

      expect(result.products).toEqual(mockResponse.products);
      expect(result.recipes.length).toBe(0);
    });
  });

  describe('getRecipeSuggestions', () => {
    const mockProducts = [
      { id: '1', name: 'Chicken', confidence: 0.95 },
      { id: '2', name: 'Rice', confidence: 0.9 },
    ];

    it('should successfully get recipe suggestions', async () => {
      const mockRecipes = [
        {
          id: '1',
          name: 'Chicken Rice',
          ingredients: ['200g chicken', '100g rice'],
          instructions: '1. Cook rice...',
          prepTime: '30 min',
          difficulty: 'easy',
        },
      ];

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockRecipes),
        },
      });

      const result = await getRecipeSuggestions(mockProducts);

      expect(result).toEqual(mockRecipes);
    });

    it('should handle API errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Network error'));

      await expect(getRecipeSuggestions(mockProducts)).rejects.toThrow('RECIPE_FAILED');
    });

    it('should handle response without valid JSON array', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'No valid JSON array here',
        },
      });

      await expect(getRecipeSuggestions(mockProducts)).rejects.toThrow('RECIPE_FAILED');
    });

    it('should extract JSON array from response with extra text', async () => {
      const mockRecipes = [{ id: '1', name: 'Test Recipe' }];

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => `Here are the recipes:\n${JSON.stringify(mockRecipes)}\nEnjoy!`,
        },
      });

      const result = await getRecipeSuggestions(mockProducts);

      expect(result).toEqual(mockRecipes);
    });
  });
});

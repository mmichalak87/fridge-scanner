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

// Mock errorLogger
const mockLoggerError = jest.fn();
jest.mock('../../utils/errorLogger', () => ({
  logger: {
    error: (...args: any[]) => mockLoggerError(...args),
    log: jest.fn(),
    warn: jest.fn(),
  },
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
          { id: '1', name: 'Milk', emoji: '🥛', confidence: 0.95 },
          { id: '2', name: 'Eggs', emoji: '🥚', confidence: 0.92 },
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

    it('should handle response with extra text around JSON', async () => {
      const mockResponse = {
        products: [{ id: '1', name: 'Apple', emoji: '🍎', confidence: 0.9 }],
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

    it('should handle empty products and recipes gracefully', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({}),
        },
      });

      const result = await analyzeImage(mockBase64Image);

      expect(result.products).toEqual([]);
      expect(result.recipes).toEqual([]);
      expect(result.completeRecipes).toEqual([]);
      expect(result.needMoreRecipes).toEqual([]);
    });

    it('should pass through emoji from Gemini response', async () => {
      const mockResponse = {
        products: [
          { id: '1', name: 'Milk', emoji: '🥛', confidence: 0.95 },
          { id: '2', name: 'Tuna Paste', emoji: '🐟', confidence: 0.9 },
        ],
        completeRecipes: [],
        needMoreRecipes: [],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });

      const result = await analyzeImage(mockBase64Image);

      expect(result.products[0].emoji).toBe('🥛');
      expect(result.products[1].emoji).toBe('🐟');
    });

    it('should pass through imageSearchTerm from Gemini response', async () => {
      const mockResponse = {
        products: [{ id: '1', name: 'Eggs', emoji: '🥚', confidence: 0.95 }],
        completeRecipes: [
          {
            id: '1',
            name: 'Scrambled Eggs',
            emoji: '🍳',
            imageSearchTerm: 'scrambled eggs',
            ingredients: ['2 eggs'],
            availableIngredients: ['eggs'],
            missingIngredients: [],
            instructions: '1. Beat eggs...',
            prepTime: '10 min',
            difficulty: 'easy',
          },
        ],
        needMoreRecipes: [],
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });

      const result = await analyzeImage(mockBase64Image);

      expect(result.completeRecipes![0].imageSearchTerm).toBe('scrambled eggs');
    });

    // --- NOT_FRIDGE_IMAGE error handling ---

    it('should throw NOT_FRIDGE_IMAGE when response has no JSON', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            'I cannot analyze this image because it shows flowers and greenery, not a fridge.',
        },
      });

      await expect(analyzeImage(mockBase64Image)).rejects.toThrow('NOT_FRIDGE_IMAGE');
    });

    it('should throw NOT_FRIDGE_IMAGE for any plain text response without JSON', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Sorry, I am unable to identify any food products in this image.',
        },
      });

      await expect(analyzeImage(mockBase64Image)).rejects.toThrow('NOT_FRIDGE_IMAGE');
    });

    it('should throw NOT_FRIDGE_IMAGE for empty response', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => '',
        },
      });

      await expect(analyzeImage(mockBase64Image)).rejects.toThrow('NOT_FRIDGE_IMAGE');
    });

    it('should NOT send NOT_FRIDGE_IMAGE to Crashlytics', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'This is not a fridge image',
        },
      });

      await expect(analyzeImage(mockBase64Image)).rejects.toThrow('NOT_FRIDGE_IMAGE');
      expect(mockLoggerError).not.toHaveBeenCalled();
    });

    // --- ANALYSIS_FAILED error handling ---

    it('should throw ANALYSIS_FAILED on API network error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Network error'));

      await expect(analyzeImage(mockBase64Image)).rejects.toThrow('ANALYSIS_FAILED');
    });

    it('should throw ANALYSIS_FAILED on API timeout', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Request timed out'));

      await expect(analyzeImage(mockBase64Image)).rejects.toThrow('ANALYSIS_FAILED');
    });

    it('should throw ANALYSIS_FAILED when JSON is malformed', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => '{"products": [broken json}',
        },
      });

      await expect(analyzeImage(mockBase64Image)).rejects.toThrow('ANALYSIS_FAILED');
    });

    it('should send ANALYSIS_FAILED errors to Crashlytics via logger', async () => {
      const networkError = new Error('Network error');
      mockGenerateContent.mockRejectedValue(networkError);

      await expect(analyzeImage(mockBase64Image)).rejects.toThrow('ANALYSIS_FAILED');
      expect(mockLoggerError).toHaveBeenCalledWith('Gemini analysis failed', networkError);
    });

    it('should send malformed JSON errors to Crashlytics via logger', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => '{"products": [broken}',
        },
      });

      await expect(analyzeImage(mockBase64Image)).rejects.toThrow('ANALYSIS_FAILED');
      expect(mockLoggerError).toHaveBeenCalledTimes(1);
      expect(mockLoggerError).toHaveBeenCalledWith('Gemini analysis failed', expect.any(Error));
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

    it('should throw RECIPE_FAILED on API error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Network error'));

      await expect(getRecipeSuggestions(mockProducts)).rejects.toThrow('RECIPE_FAILED');
    });

    it('should throw RECIPE_FAILED when response has no JSON array', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'No valid JSON array here',
        },
      });

      await expect(getRecipeSuggestions(mockProducts)).rejects.toThrow('RECIPE_FAILED');
    });

    it('should send RECIPE_FAILED errors to Crashlytics via logger', async () => {
      const networkError = new Error('Network error');
      mockGenerateContent.mockRejectedValue(networkError);

      await expect(getRecipeSuggestions(mockProducts)).rejects.toThrow('RECIPE_FAILED');
      expect(mockLoggerError).toHaveBeenCalledWith('Recipe suggestions failed', networkError);
    });
  });
});

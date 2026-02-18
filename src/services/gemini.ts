import { GoogleGenerativeAI } from '@google/generative-ai';
import Config from 'react-native-config';
import { AnalysisResult, Product, Recipe } from '../types';
import i18n from '../locales/i18n';

const API_KEY = Config.GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);

const getLanguageName = (code: string): string => {
  const languages: Record<string, string> = {
    en: 'English',
    pl: 'Polish',
    uk: 'Ukrainian',
    de: 'German',
  };
  return languages[code] || 'English';
};

const getAnalysisPrompt = (language: string) => `You are a helpful culinary assistant that analyzes fridge contents from images.

IMPORTANT: All product names, recipe names, ingredients, and instructions MUST be in ${language}.

IMPORTANT ASSUMPTION: Everyone has these basic pantry items at home (do NOT count these as missing):
- Salt, pepper, sugar
- Cooking oil (vegetable, olive, etc.)
- Water
- Basic spices and herbs
- Flour, rice, pasta (common staples)
- Vinegar, soy sauce (common condiments)

Analyze this image of a fridge and:
1. Identify all visible food products and ingredients
2. Suggest recipes in TWO categories:

CATEGORY 1 - "completeRecipes" (3 recipes):
- Recipes that can be made with ONLY the visible ingredients + basic pantry items
- These should be fully achievable without shopping

CATEGORY 2 - "needMoreRecipes" (2 recipes):
- More elaborate recipes that need 1-2 additional ingredients
- Include what's missing and suggest alternatives from available ingredients

IMPORTANT: Respond ONLY with valid JSON in this exact format, no additional text:
{
  "products": [
    {"id": "1", "name": "product name", "confidence": 0.95}
  ],
  "completeRecipes": [
    {
      "id": "1",
      "name": "Recipe Name",
      "ingredients": ["200g ingredient1", "2 tbsp ingredient2", "salt and pepper to taste"],
      "availableIngredients": ["ingredient1", "ingredient2", "salt", "pepper"],
      "missingIngredients": [],
      "instructions": "DETAILED step-by-step instructions...",
      "prepTime": "20 min",
      "difficulty": "easy",
      "category": "complete"
    }
  ],
  "needMoreRecipes": [
    {
      "id": "4",
      "name": "Recipe Name",
      "ingredients": ["200g ingredient1", "100g missing ingredient"],
      "availableIngredients": ["ingredient1"],
      "missingIngredients": ["missing ingredient"],
      "substitution": {
        "original": "missing ingredient",
        "replacement": "available substitute",
        "reason": "why this works"
      },
      "alternatives": [
        {
          "name": "Simpler Alternative",
          "description": "Brief description using only available ingredients",
          "missingIngredient": "what you'd need for the main recipe"
        }
      ],
      "instructions": "DETAILED step-by-step instructions...",
      "prepTime": "30 min",
      "difficulty": "medium",
      "category": "needMore"
    }
  ]
}

INSTRUCTIONS REQUIREMENTS:
- Include exact quantities in ingredients (grams, cups, tablespoons)
- Number each step (1. 2. 3. etc.)
- Include cooking temperatures (°C or °F)
- Include timing for each step where relevant
- Mention heat levels (low, medium, high)
- Include tips for best results

ALTERNATIVES REQUIREMENTS:
- Include 1-2 alternatives for recipes in needMoreRecipes
- Each alternative should use ONLY available ingredients
- The alternative should be a complete, different dish

If no substitution is possible, set "substitution" to null.
The "difficulty" field must be one of: "easy", "medium", "hard".
Be thorough in identifying products - look for items on all shelves, in door compartments, and drawers.

REMEMBER: All text content (product names, recipe names, ingredients, instructions, reasons) MUST be in ${language}.`;

export async function analyzeImage(base64Image: string): Promise<AnalysisResult> {
  const currentLanguage = getLanguageName(i18n.language);
  const ANALYSIS_PROMPT = getAnalysisPrompt(currentLanguage);
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured. Set GEMINI_API_KEY in your .env file.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg',
      },
    };

    const result = await model.generateContent([ANALYSIS_PROMPT, imagePart]);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse response as JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Combine recipes for backward compatibility, but also keep them separate
    const completeRecipes = (parsed.completeRecipes || []).map((r: Recipe) => ({
      ...r,
      category: 'complete' as const,
    }));
    const needMoreRecipes = (parsed.needMoreRecipes || []).map((r: Recipe) => ({
      ...r,
      category: 'needMore' as const,
    }));

    return {
      products: parsed.products || [],
      recipes: [...completeRecipes, ...needMoreRecipes],
      completeRecipes,
      needMoreRecipes,
    };
  } catch (error) {
    // Detailed logging for debugging
    console.error('=== Gemini Analysis Error ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    console.error('=============================');

    // Throw a generic error for the UI
    throw new Error('ANALYSIS_FAILED');
  }
}

export async function getRecipeSuggestions(products: Product[]): Promise<Recipe[]> {
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const currentLanguage = getLanguageName(i18n.language);
  const productNames = products.map(p => p.name).join(', ');

  const prompt = `Given these ingredients: ${productNames}

IMPORTANT: All recipe names, ingredients, and instructions MUST be in ${currentLanguage}.

ASSUMPTION: Basic pantry items are available (salt, pepper, oil, sugar, water, basic spices).

Suggest 5 recipes:
- First 3: Can be made with ONLY the given ingredients + basic pantry items
- Last 2: Need 1-2 additional ingredients (include alternatives)

Respond ONLY with valid JSON array with detailed recipes. All text MUST be in ${currentLanguage}.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse recipes response');
    }

    return JSON.parse(jsonMatch[0]) as Recipe[];
  } catch (error) {
    // Detailed logging for debugging
    console.error('=== Recipe Suggestions Error ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    console.error('================================');

    // Throw a generic error for the UI
    throw new Error('RECIPE_FAILED');
  }
}

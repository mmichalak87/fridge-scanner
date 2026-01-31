export interface Product {
  id: string;
  name: string;
  confidence?: number;
}

export interface Substitution {
  original: string;
  replacement: string;
  reason?: string;
}

export interface AlternativeRecipe {
  name: string;
  description: string;
  missingIngredient: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  availableIngredients: string[];
  missingIngredients: string[];
  substitution?: Substitution;
  instructions: string;
  prepTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  alternatives?: AlternativeRecipe[];
  category?: 'complete' | 'needMore';
}

export interface AnalysisResult {
  products: Product[];
  recipes: Recipe[];
  completeRecipes?: Recipe[];
  needMoreRecipes?: Recipe[];
}

export interface AppState {
  imageUri: string | null;
  isAnalyzing: boolean;
  products: Product[];
  recipes: Recipe[];
  error: string | null;
}

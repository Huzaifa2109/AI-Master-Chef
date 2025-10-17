import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

// Fix: Implement the Gemini service to generate recipes. This file was previously empty.
// It now contains the logic to call the Google GenAI API with a structured prompt
// and a JSON schema to get recipe data in a predictable format.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerateRecipeParams {
  ingredients: string[];
  equipment: string[];
  language: string;
  mealType: string;
  dietaryRestrictions: string;
  mode: 'ingredients' | 'dish';
  dishName: string;
}

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "The name of the recipe." },
      ingredients: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of ingredients with quantities."
      },
      instructions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Step-by-step cooking instructions."
      },
      prep_time: { type: Type.STRING, description: "Preparation time, e.g., '15 minutes'." },
      cook_time: { type: Type.STRING, description: "Cooking time, e.g., '30 minutes'." },
      servings: { type: Type.STRING, description: "Number of servings, e.g., '4 servings'." },
      nutrition: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.STRING, description: "Estimated calories per serving." },
          protein: { type: Type.STRING, description: "Estimated protein per serving in grams." },
          carbohydrates: { type: Type.STRING, description: "Estimated carbohydrates per serving in grams." },
          fat: { type: Type.STRING, description: "Estimated fat per serving in grams." },
        },
        required: ['calories', 'protein', 'carbohydrates', 'fat']
      }
    },
    required: ['name', 'ingredients', 'instructions', 'prep_time', 'cook_time', 'servings', 'nutrition']
};

export const generateRecipe = async (params: GenerateRecipeParams): Promise<Recipe> => {
  const { ingredients, equipment, language, mealType, dietaryRestrictions, mode, dishName } = params;

  let prompt = `You are a creative chef. Generate a detailed recipe.`;

  if (mode === 'dish') {
    prompt += ` The requested dish is "${dishName}".`;
  } else {
    prompt += ` The recipe must use the following ingredients: ${ingredients.join(', ')}. You can add a few common pantry staples if necessary.`;
  }

  if (equipment.length > 0) {
    prompt += ` The user has the following kitchen equipment available: ${equipment.join(', ')}. The recipe should only use this equipment.`;
  }

  if (mealType !== 'Any') {
    prompt += ` This recipe is for ${mealType}.`;
  }

  if (dietaryRestrictions) {
    prompt += ` Please adhere to the following dietary restrictions: ${dietaryRestrictions}.`;
  }

  prompt += ` The response must be in the ${language} language. The recipe name should be appealing. The instructions should be clear and easy to follow.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const text = response.text.trim();
    const recipeData = JSON.parse(text);
    
    return {
      ...recipeData,
      id: `${recipeData.name.replace(/\s+/g, '-')}-${Date.now()}`
    };
  } catch (error) {
    console.error("Error generating recipe:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate recipe: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the recipe.');
  }
};

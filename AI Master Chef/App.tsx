import React, { useState, useEffect } from 'react';
import { useLanguage } from './hooks/useLanguage';
import { Recipe } from './types';
import { generateRecipe } from './services/geminiService';

import IngredientInput from './components/IngredientInput';
import IngredientList from './components/IngredientList';
import EquipmentInput from './components/EquipmentInput';
import EquipmentList from './components/EquipmentList';
import RecipeDisplay from './components/RecipeDisplay';
import CookingAnimation from './components/CookingAnimation';
import RecipeHistory from './components/RecipeHistory';
import FavoritesList from './components/FavoritesList';
import ToggleSwitch from './components/ToggleSwitch';

const App: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  
  const [generationMode, setGenerationMode] = useState<'ingredients' | 'dish'>('ingredients');

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [dishName, setDishName] = useState('');
  const [mealType, setMealType] = useState('Any');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [ratings, setRatings] = useState<{ [recipeId: string]: number }>({});
  
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('recipeHistory');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      
      const savedFavorites = localStorage.getItem('recipeFavorites');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      
      const savedRatings = localStorage.getItem('recipeRatings');
      if (savedRatings) setRatings(JSON.parse(savedRatings));
    } catch (e) {
      console.error("Failed to parse from localStorage", e);
      localStorage.removeItem('recipeHistory');
      localStorage.removeItem('recipeFavorites');
      localStorage.removeItem('recipeRatings');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('recipeHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
  }, [favorites]);
  
  useEffect(() => {
    localStorage.setItem('recipeRatings', JSON.stringify(ratings));
  }, [ratings]);

  const handleGenerateRecipe = async () => {
    if (generationMode === 'ingredients' && ingredients.length === 0) {
      setError(t('errorNoIngredients'));
      setTimeout(() => setError(null), 3000);
      return;
    }
     if (generationMode === 'dish' && dishName.trim() === '') {
      setError(t('errorNoDishName'));
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCurrentRecipe(null);
    
    try {
      const newRecipe = await generateRecipe({
        ingredients,
        equipment,
        language,
        mealType,
        dietaryRestrictions,
        mode: generationMode,
        dishName
      });
      setCurrentRecipe(newRecipe);
      setHistory(prev => [newRecipe, ...prev.filter(r => r.id !== newRecipe.id)].slice(0, 9));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleToggleFavorite = (recipe: Recipe) => {
    setFavorites(prev => 
      prev.some(fav => fav.id === recipe.id) 
        ? prev.filter(fav => fav.id !== recipe.id) 
        : [recipe, ...prev]
    );
  };
  
  const handleRateRecipe = (recipeId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [recipeId]: rating }));
  };
  
  const handleProvideFeedback = (recipeId: string, comment: string) => {
    // In a real application, you would send this feedback to a server.
    // For this example, we'll just log it to the console.
    console.log(`Feedback received for recipe ${recipeId}: "${comment}"`);
  };
  
  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 text-transparent bg-clip-text">
            {t('appTitle')}
          </h1>
          <select 
            value={language} 
            onChange={e => setLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="hi">हिन्दी</option>
            <option value="ur">اردو</option>
            <option value="mr">मराठी</option>
            <option value="bn">বাংলা</option>
            <option value="ta">தமிழ்</option>
            <option value="te">తెలుగు</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="gu">ગુજરાતી</option>
            <option value="pa">ਪੰਜਾਬੀ</option>
          </select>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">

            <ToggleSwitch
              option1={t('byIngredients')}
              option2={t('byDishName')}
              onToggle={(mode) => setGenerationMode(mode)}
            />

            {generationMode === 'ingredients' ? (
              <>
                <div className="bg-slate-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-slate-200 mb-4">{t('yourIngredients')}</h2>
                  <IngredientInput onAdd={setIngredients} />
                  <IngredientList ingredients={ingredients} onRemove={setIngredients} />
                </div>
                
                <div className="bg-slate-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-slate-200 mb-4">{t('yourEquipment')}</h2>
                  <EquipmentInput onAdd={setEquipment} />
                  <EquipmentList equipment={equipment} onRemove={setEquipment} />
                </div>
              </>
            ) : (
               <div className="bg-slate-800 rounded-lg p-6">
                 <h2 className="text-xl font-bold text-slate-200 mb-4">{t('dishNameLabel')}</h2>
                  <input
                    type="text"
                    value={dishName}
                    onChange={e => setDishName(e.target.value)}
                    placeholder={t('dishNamePlaceholder')}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
               </div>
            )}


            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-slate-200 mb-4">{t('preferences')}</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="mealType" className="block text-sm font-medium text-slate-400 mb-1">{t('mealType')}</label>
                  <select
                    id="mealType"
                    value={mealType}
                    onChange={e => setMealType(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Any">{t('any')}</option>
                    <option value="Breakfast">{t('breakfast')}</option>
                    <option value="Lunch">{t('lunch')}</option>
                    <option value="Dinner">{t('dinner')}</option>
                    <option value="Snack">{t('snack')}</option>
                    <option value="Dessert">{t('dessert')}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="diet" className="block text-sm font-medium text-slate-400 mb-1">{t('dietaryRestrictions')}</label>
                  <input
                    type="text"
                    id="diet"
                    value={dietaryRestrictions}
                    onChange={e => setDietaryRestrictions(e.target.value)}
                    placeholder={t('dietaryPlaceholder')}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateRecipe}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
            >
              {isLoading ? t('cooking') : t('generateRecipe')}
            </button>
            
            {error && <p className="text-red-400 text-center mt-4 bg-red-900/50 p-3 rounded-md">{error}</p>}
          </div>

          <div className="lg:col-span-2 space-y-8">
            {isLoading && <CookingAnimation />}
            
            {currentRecipe && (
              <RecipeDisplay 
                recipe={currentRecipe}
                onFavorite={handleToggleFavorite}
                isFavorite={favorites.some(fav => fav.id === currentRecipe.id)}
                onRate={handleRateRecipe}
                userRating={ratings[currentRecipe.id] || 0}
                onProvideFeedback={handleProvideFeedback}
              />
            )}
            
            {!isLoading && !currentRecipe && (
              <div className="bg-slate-800 rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
                <p className="text-2xl text-slate-400 font-semibold">{t('welcomeMessage')}</p>
                <p className="text-slate-500 mt-2">{t('welcomeSubMessage')}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <RecipeHistory history={history} onSelect={handleSelectRecipe} onClear={handleClearHistory} />
              <FavoritesList favorites={favorites} onSelect={handleSelectRecipe} onRemove={handleToggleFavorite} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Recipe } from '../types';

interface RecipeHistoryProps {
  history: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onClear: () => void;
}

const RecipeHistory: React.FC<RecipeHistoryProps> = ({ history, onSelect, onClear }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-200">{t('recipeHistory')}</h2>
        {history.length > 0 && (
          <button onClick={onClear} className="text-sm text-slate-400 hover:text-white hover:underline">
            {t('clearHistory')}
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="text-slate-400">{t('noHistory')}</p>
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {history.map(recipe => (
            <li key={recipe.id}>
              <button
                onClick={() => onSelect(recipe)}
                className="w-full text-left text-teal-300 hover:bg-slate-700 p-2 rounded-md transition-colors"
              >
                {recipe.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecipeHistory;

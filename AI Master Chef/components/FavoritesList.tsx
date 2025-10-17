import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Recipe } from '../types';
import TrashIcon from './icons/TrashIcon';

interface FavoritesListProps {
  favorites: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onRemove: (recipe: Recipe) => void;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ favorites, onSelect, onRemove }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-slate-200 mb-4">{t('favoriteRecipes')}</h2>
      {favorites.length === 0 ? (
        <p className="text-slate-400">{t('noFavorites')}</p>
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {favorites.map(recipe => (
            <li key={recipe.id} className="flex justify-between items-center group">
              <button
                onClick={() => onSelect(recipe)}
                className="flex-grow text-left text-amber-300 hover:bg-slate-700 p-2 rounded-md transition-colors"
              >
                {recipe.name}
              </button>
              <button
                onClick={() => onRemove(recipe)}
                className="ml-2 p-2 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`${t('unfavorite')} ${recipe.name}`}
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoritesList;

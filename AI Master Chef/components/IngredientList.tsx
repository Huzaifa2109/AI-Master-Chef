import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import TrashIcon from './icons/TrashIcon';

interface IngredientListProps {
  ingredients: string[];
  onRemove: (ingredients: React.SetStateAction<string[]>) => void;
}

const IngredientList: React.FC<IngredientListProps> = ({ ingredients, onRemove }) => {
  const { t } = useLanguage();

  const handleRemove = (index: number) => {
    onRemove(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2 text-slate-300">{t('yourPantry')}</h2>
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient, index) => (
          <span key={index} className="flex items-center bg-teal-800/50 text-teal-200 text-sm font-medium px-3 py-1 rounded-full">
            {ingredient}
            <button onClick={() => handleRemove(index)} className="ml-2 text-teal-300 hover:text-white" aria-label={`Remove ${ingredient}`}>
              <TrashIcon />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default IngredientList;

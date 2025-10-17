import React, { useState, KeyboardEvent } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import PlusIcon from './icons/PlusIcon';

interface IngredientInputProps {
  onAdd: (ingredients: React.SetStateAction<string[]>) => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ onAdd }) => {
  const [value, setValue] = useState('');
  const { t } = useLanguage();
  const [error, setError] = useState(false);

  const handleAdd = () => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      onAdd(prev => [...prev, trimmedValue]);
      setValue('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 820);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else {
      if(error) setError(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('addIngredientPlaceholder')}
        className={`flex-grow bg-slate-800 border-2 ${error ? 'border-red-500 shake' : 'border-slate-700'} rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors`}
      />
      <button
        onClick={handleAdd}
        className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold p-3 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105"
        aria-label={t('add')}
      >
        <PlusIcon />
      </button>
    </div>
  );
};

export default IngredientInput;

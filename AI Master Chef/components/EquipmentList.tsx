import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import TrashIcon from './icons/TrashIcon';

interface EquipmentListProps {
  equipment: string[];
  onRemove: (equipment: React.SetStateAction<string[]>) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ equipment, onRemove }) => {
  const { t } = useLanguage();

  const handleRemove = (index: number) => {
    onRemove(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2 text-slate-300">{t('yourKitchen')}</h2>
      <div className="flex flex-wrap gap-2">
        {equipment.map((item, index) => (
          <span key={index} className="flex items-center bg-cyan-800/50 text-cyan-200 text-sm font-medium px-3 py-1 rounded-full">
            {item}
            <button onClick={() => handleRemove(index)} className="ml-2 text-cyan-300 hover:text-white" aria-label={`Remove ${item}`}>
              <TrashIcon />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default EquipmentList;

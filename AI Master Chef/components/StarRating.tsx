import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import StarIcon from './icons/StarIcon';

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRate }) => {
  const { t } = useLanguage();
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-semibold text-slate-400">{t('userRating')}:</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-slate-500 focus:outline-none"
            aria-label={`${t('rateRecipe')} ${star} ${star > 1 ? 'stars' : 'star'}`}
          >
            <StarIcon 
              className="w-5 h-5 transition-colors" 
              filled={(hoverRating || rating) >= star} 
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default StarRating;

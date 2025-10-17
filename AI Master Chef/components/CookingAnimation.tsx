import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

const CookingAnimation: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="bg-slate-800 rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] space-y-4">
            <div className="text-4xl cooking-animation">
                <span>🥕</span>
                <span>🔪</span>
                <span>🍳</span>
            </div>
            <p className="text-slate-400 text-lg font-semibold animate-pulse">{t('cookingUp')}</p>
        </div>
    );
};

export default CookingAnimation;

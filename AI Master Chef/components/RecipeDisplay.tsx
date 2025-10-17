import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Recipe } from '../types';
import StarRating from './StarRating';
import StarIcon from './icons/StarIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';
import ShareIcon from './icons/ShareIcon';
import PdfIcon from './icons/PdfIcon';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import StopIcon from './icons/StopIcon';

declare const jspdf: any;
declare const html2canvas: any;

interface RecipeDisplayProps {
  recipe: Recipe | null;
  onFavorite: (recipe: Recipe) => void;
  isFavorite: boolean;
  onRate: (recipeId: string, rating: number) => void;
  userRating: number;
  onProvideFeedback: (recipeId: string, comment: string) => void;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, onFavorite, isFavorite, onRate, userRating, onProvideFeedback }) => {
  const { t, language } = useLanguage();
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const [ttsState, setTtsState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const recipeCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stop TTS when recipe changes or component unmounts
    return () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setTtsState('idle');
    };
  }, [recipe]);

  if (!recipe) {
    return null;
  }

  const handleCopyInstructions = () => {
    const instructionsText = recipe.instructions.map((step, index) => `${index + 1}. ${step}`).join('\n');
    navigator.clipboard.writeText(instructionsText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleShare = () => {
    const shareableLink = `${window.location.origin}${window.location.pathname}#recipe=${btoa(JSON.stringify(recipe))}`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    });
  };

  const handleExportPdf = () => {
    if (!recipeCardRef.current) return;
    setIsExportingPdf(true);
    html2canvas(recipeCardRef.current, {
        useCORS: true,
        scale: 2, 
        backgroundColor: '#1f2937' // bg-slate-800
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth - 20; // with margin
        const height = width / ratio;
        
        let finalHeight = height;
        if (height > pdfHeight - 20) {
            finalHeight = pdfHeight - 20;
        }

        pdf.addImage(imgData, 'PNG', 10, 10, width, finalHeight);
        pdf.save(`${recipe.name.replace(/\s+/g, '_')}.pdf`);
    }).catch(err => {
        console.error("PDF export failed:", err);
        alert(t('pdfExportError'));
    }).finally(() => {
        setIsExportingPdf(false);
    });
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert(t('speechNotSupported'));
      return;
    }
    
    if (ttsState === 'playing') {
      window.speechSynthesis.pause();
      setTtsState('paused');
    } else if (ttsState === 'paused') {
      window.speechSynthesis.resume();
      setTtsState('playing');
    } else {
      const allInstructions = recipe.instructions.join('. ');
      const utterance = new SpeechSynthesisUtterance(allInstructions);
      
      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(voice => voice.lang.startsWith(language.split('-')[0]));
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      utterance.onend = () => setTtsState('idle');
      utterance.onerror = () => setTtsState('idle');
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setTtsState('playing');
    }
  };

  const handleStopSpeech = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setTtsState('idle');
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
        onProvideFeedback(recipe.id, feedback.trim());
        setFeedbackSubmitted(true);
        setFeedback('');
        setTimeout(() => setFeedbackSubmitted(false), 3000);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg fade-in" ref={recipeCardRef}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 text-transparent bg-clip-text pr-4">{recipe.name}</h2>
          <button onClick={() => onFavorite(recipe)} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label={isFavorite ? t('unfavorite') : t('favorite')}>
            <StarIcon filled={isFavorite} className="w-7 h-7" />
          </button>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400 mb-6 border-b border-slate-700 pb-4 text-sm">
          <span>{t('prepTime')}: <span className="font-semibold text-slate-300">{recipe.prep_time}</span></span>
          <span>{t('cookTime')}: <span className="font-semibold text-slate-300">{recipe.cook_time}</span></span>
          <span>{t('servings')}: <span className="font-semibold text-slate-300">{recipe.servings}</span></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-slate-200">{t('ingredients')}</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </div>
            {recipe.nutrition && (
                 <div>
                    <h3 className="text-xl font-semibold mb-3 text-slate-200">{t('nutrition')}</h3>
                    <ul className="text-sm text-slate-400 space-y-1">
                        <li>{t('calories')}: <span className="font-medium text-slate-300">{recipe.nutrition.calories}</span></li>
                        <li>{t('protein')}: <span className="font-medium text-slate-300">{recipe.nutrition.protein}</span></li>
                        <li>{t('carbohydrates')}: <span className="font-medium text-slate-300">{recipe.nutrition.carbohydrates}</span></li>
                        <li>{t('fat')}: <span className="font-medium text-slate-300">{recipe.nutrition.fat}</span></li>
                    </ul>
                </div>
            )}
          </div>

          <div className="md:col-span-2">
             <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold text-slate-200">{t('instructions')}</h3>
                <div className="flex items-center space-x-1">
                    <button onClick={handleSpeech} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label={ttsState === 'playing' ? t('pauseSpeech') : t('readAloud')}>
                        {ttsState === 'playing' ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button onClick={handleStopSpeech} disabled={ttsState === 'idle'} className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity" aria-label={t('stopSpeech')}>
                        <StopIcon />
                    </button>
                </div>
            </div>
            <ol className="list-decimal list-inside space-y-3 text-slate-300">
              {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-700 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
            <button onClick={handleCopyInstructions} className="flex items-center space-x-1.5 text-sm bg-slate-700 px-3 py-2 rounded-md hover:bg-slate-600 transition-colors">
                {isCopied ? <CheckIcon/> : <ClipboardIcon />}
                <span>{isCopied ? t('copied') : t('copyInstructions')}</span>
            </button>
            <button onClick={handleShare} className="flex items-center space-x-1.5 text-sm bg-slate-700 px-3 py-2 rounded-md hover:bg-slate-600 transition-colors">
                {isLinkCopied ? <CheckIcon/> : <ShareIcon />}
                <span>{isLinkCopied ? t('linkCopied') : t('share')}</span>
            </button>
            <button onClick={handleExportPdf} disabled={isExportingPdf} className="flex items-center space-x-1.5 text-sm bg-slate-700 px-3 py-2 rounded-md hover:bg-slate-600 transition-colors disabled:opacity-50">
                <PdfIcon />
                <span>{isExportingPdf ? t('exportingPdf') : t('exportToPdf')}</span>
            </button>
        </div>
        <StarRating rating={userRating} onRate={(rating) => onRate(recipe.id, rating)} />
      </div>

      <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-2">{t('feedbackTitle')}</h3>
        <form onSubmit={handleFeedbackSubmit} className="flex items-start space-x-2">
            <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t('feedbackPlaceholder')}
                className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                rows={2}
            />
            <button type="submit" className="bg-cyan-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors text-sm">
                {t('submitFeedback')}
            </button>
        </form>
        {feedbackSubmitted && <p className="text-green-400 text-sm mt-2">{t('feedbackSubmitted')}</p>}
      </div>

    </div>
  );
};

export default RecipeDisplay;

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(localStorage.getItem('language') || 'en');
  const [translations, setTranslations] = useState<{ [key: string]: { [key: string]: string } }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const languages = ['en', 'es', 'hi', 'ur', 'mr', 'bn', 'ta', 'te', 'kn', 'gu', 'pa'];

    const fetchTranslations = async () => {
      setIsLoading(true);
      // First, fetch English so we have a reliable fallback in memory.
      let englishFallback: { [key: string]: string } = {};
      try {
          const enResponse = await fetch('/locales/en.json');
          if (!enResponse.ok) throw new Error("English translation file failed to load");
          englishFallback = await enResponse.json();
      } catch (error) {
          console.error("CRITICAL: Could not load English fallback translations. The app may not display text correctly.", error);
      }

      const promises = languages.map(lang => 
          fetch(`/locales/${lang}.json`).then(res => {
              if (!res.ok) throw new Error(`Could not load translation for ${lang}`);
              return res.json().then(data => ({ lang, data }));
          })
      );

      const results = await Promise.allSettled(promises);
      
      const finalTranslations = languages.reduce((acc, lang, index) => {
          const result = results[index];
          if (result.status === 'fulfilled') {
              acc[lang] = result.value.data;
          } else {
              console.error(`Failed to load '${lang}.json', falling back to English.`, result.reason);
              // For the language that failed, assign the English fallback.
              // If English itself failed, englishFallback will be {} and keys will be missing, which is acceptable.
              acc[lang] = englishFallback;
          }
          return acc;
      }, {} as { [key: string]: { [key: string]: string } });
      
      setTranslations(finalTranslations);
      setIsLoading(false);
    };

    fetchTranslations();
  }, []);

  const setLanguage = (lang: string) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] || key;
  }, [language, translations]);

  if (isLoading) {
    return <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center">Loading languages...</div>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

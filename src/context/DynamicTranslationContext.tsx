import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface DynamicTranslationContextType {
  tDynamic: (text: string) => string;
}

const DynamicTranslationContext = createContext<DynamicTranslationContextType | undefined>(undefined);

const translationCache = new Map<string, string>();

export const DynamicTranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const translateText = useCallback(async (text: string, targetLang: string) => {
    const cacheKey = `${targetLang}:${text}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { text, target_lang: targetLang },
      });

      if (error) {
        throw error;
      }
      
      const translatedText = data.translatedText;
      translationCache.set(cacheKey, translatedText);
      setTranslations(prev => ({ ...prev, [cacheKey]: translatedText }));
      return translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      // Return original text on failure
      return text;
    }
  }, []);

  const tDynamic = (text: string): string => {
    const targetLang = i18n.language;

    if (!text || targetLang === 'fa') {
      return text;
    }

    const cacheKey = `${targetLang}:${text}`;
    const cachedTranslation = translationCache.get(cacheKey);

    if (cachedTranslation) {
      return cachedTranslation;
    }

    // If not in cache, trigger translation but return original text for now
    // The component will re-render once the translation is available
    if (!translations[cacheKey]) {
      translateText(text, targetLang);
    }

    return translations[cacheKey] || text; // Show original text while loading
  };

  return (
    <DynamicTranslationContext.Provider value={{ tDynamic }}>
      {children}
    </DynamicTranslationContext.Provider>
  );
};

export const useDynamicTranslation = () => {
  const context = useContext(DynamicTranslationContext);
  if (context === undefined) {
    throw new Error('useDynamicTranslation must be used within a DynamicTranslationProvider');
  }
  return context;
};
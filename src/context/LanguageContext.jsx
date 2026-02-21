import React, { createContext, useContext, useState, useCallback } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ne');
  
  const toggleLanguage = () => setLanguage((prev) => (prev === 'en' ? 'ne' : 'en'));
  
  // Helper function to get label in current language
  const getLabel = useCallback((labelObj) => {
    if (!labelObj) return '';
    return labelObj[language] || labelObj.en || '';
  }, [language]);
  
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, getLabel }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

// Alias for useLang as requested
export const useLang = () => useContext(LanguageContext); 
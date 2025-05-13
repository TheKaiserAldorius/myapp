import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

/** Обёртка над приложением для переключения RU/EN */
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ru');
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Хук для получения и смены языка */
export function useLanguage() {
  return useContext(LanguageContext);
}

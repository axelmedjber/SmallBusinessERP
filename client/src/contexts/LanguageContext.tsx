import { createContext, useState, useEffect, ReactNode } from "react";
import { Language, Direction } from "@/lib/types";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  direction: Direction;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage for saved language preference, default to 'en'
    const savedLanguage = localStorage.getItem("language") as Language | null;
    return savedLanguage || "en";
  });
  
  const [direction, setDirection] = useState<Direction>(() => {
    // Set direction based on the language
    return language === "ar" ? "rtl" : "ltr";
  });
  
  // Update direction when language changes
  useEffect(() => {
    setDirection(language === "ar" ? "rtl" : "ltr");
    // Save language preference to localStorage
    localStorage.setItem("language", language);
    
    // Update document direction and lang attributes
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, direction }}>
      {children}
    </LanguageContext.Provider>
  );
};

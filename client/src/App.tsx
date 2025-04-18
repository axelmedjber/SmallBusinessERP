import React, { useState, useEffect, createContext, ReactNode, useContext } from "react";
import { Language, Direction } from "@/lib/types";
import { translations } from "@/lib/utils";

// Create LanguageContext within App.tsx
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  direction: Direction;
  t: typeof translations.en;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

// LanguageProvider component
interface LanguageProviderProps {
  children: ReactNode;
}

function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [direction, setDirection] = useState<Direction>('ltr');
  
  // Update direction when language changes
  useEffect(() => {
    setDirection(language === "ar" ? "rtl" : "ltr");
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);
  
  // Get translations for current language
  const t = translations[language];
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, direction, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  
  return context;
}

// Simple language switcher component
function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div className="flex gap-2 mt-4">
      <button
        className={`px-3 py-2 rounded-md ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
        onClick={() => setLanguage('en')}
      >
        English
      </button>
      <button
        className={`px-3 py-2 rounded-md ${language === 'fr' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
        onClick={() => setLanguage('fr')}
      >
        Français
      </button>
      <button
        className={`px-3 py-2 rounded-md ${language === 'ar' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
        onClick={() => setLanguage('ar')}
      >
        العربية
      </button>
    </div>
  );
}

// Simple test app to verify language functionality
function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
          <TestComponent />
        </div>
      </div>
    </LanguageProvider>
  );
}

// Test component to display language functionality
function TestComponent() {
  const { language, t, direction } = useLanguage();
  
  return (
    <div className={`text-center ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
      <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
      
      <p className="mb-4">
        <strong>Current Language:</strong> {language}
      </p>
      <p className="mb-4">
        <strong>Current Direction:</strong> {direction}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">{t.dashboard}</h3>
          <p className="text-gray-600">{t.financialDashboard}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">{t.calendar}</h3>
          <p className="text-gray-600">{t.appointmentCalendar}</p>
        </div>
      </div>
      
      <LanguageSwitcher />
    </div>
  );
}

export default App;

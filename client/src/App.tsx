import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import { useState, useEffect } from "react";
import { Language, Direction } from "@/lib/types";

// Simplified version for testing
function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [direction, setDirection] = useState<Direction>('ltr');
  
  useEffect(() => {
    setDirection(language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);
  
  return (
    <div className={`min-h-screen flex flex-col ${direction === 'rtl' ? 'rtl' : ''}`}>
      <div className="p-4 bg-blue-500 text-white">
        <h1 className="text-2xl font-bold">Small Business ERP</h1>
        <div className="mt-2">
          <button 
            className={`mr-2 px-2 py-1 ${language === 'en' ? 'bg-white text-blue-500' : 'bg-blue-600'}`}
            onClick={() => setLanguage('en')}
          >
            English
          </button>
          <button 
            className={`mr-2 px-2 py-1 ${language === 'fr' ? 'bg-white text-blue-500' : 'bg-blue-600'}`}
            onClick={() => setLanguage('fr')}
          >
            French
          </button>
          <button 
            className={`px-2 py-1 ${language === 'ar' ? 'bg-white text-blue-500' : 'bg-blue-600'}`}
            onClick={() => setLanguage('ar')}
          >
            Arabic
          </button>
        </div>
      </div>
      <div className="p-4">
        <p>Current language: {language}</p>
        <p>Current direction: {direction}</p>
      </div>
    </div>
  );
}

export default App;

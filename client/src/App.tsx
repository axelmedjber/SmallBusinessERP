import React from "react";
import { Route, Switch } from "wouter";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/not-found";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useLanguage } from "@/hooks/use-language";

// Main App component with routing
function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8 my-8">
          <Header />
          <div className="mt-6">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/calendar" component={Calendar} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
}

// Header with navigation
function Header() {
  const { t, language, direction } = useLanguage();
  
  return (
    <div className={`text-center ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
      <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
      
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <p className="mb-1">
            <strong>Language:</strong> {language}
          </p>
          <p className="mb-1">
            <strong>Direction:</strong> {direction}
          </p>
        </div>
        <LanguageSwitcher />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <a href="/" className="no-underline">
          <div className="bg-gray-50 p-4 rounded-md cursor-pointer hover:bg-gray-100">
            <h3 className="font-medium mb-2">{t.dashboard}</h3>
            <p className="text-gray-600">{t.financialDashboard}</p>
          </div>
        </a>
        <a href="/calendar" className="no-underline">
          <div className="bg-gray-50 p-4 rounded-md cursor-pointer hover:bg-gray-100">
            <h3 className="font-medium mb-2">{t.calendar}</h3>
            <p className="text-gray-600">{t.appointmentCalendar}</p>
          </div>
        </a>
      </div>
    </div>
  );
}

// Simple language switcher component
function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  
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

export default App;
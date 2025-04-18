import { createContext, useState, useEffect, ReactNode } from "react";
import { Language, Direction } from "@/lib/types";
import { translations } from "@/lib/utils";

// Convert the translations type to a more specific type
type TranslationType = {
  title: string;
  dashboard: string;
  calendar: string;
  financialDashboard: string;
  selectPeriod: string;
  monthly: string;
  quarterly: string;
  yearly: string;
  custom: string;
  refreshData: string;
  refreshing: string;
  revenue: string;
  expenses: string;
  profit: string;
  lastPeriod: string;
  revenueVsExpenses: string;
  profitTrend: string;
  expenseBreakdown: string;
  expenseCategories: string;
  topExpenses: string;
  category: string;
  amount: string;
  percentage: string;
  appointments: string;
  appointmentCalendar: string;
  addAppointment: string;
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  appointmentTitle: string;
  date: string;
  time: string;
  duration: string;
  description: string;
  minutes: string;
  save: string;
  cancel: string;
  financialHealth: string;
  financialHealthScore: string;
  viewDetails: string;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  direction: Direction;
  t: TranslationType;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage for saved language preference, default to 'en'
    try {
      const savedLanguage = localStorage.getItem("language") as Language | null;
      return savedLanguage || "en";
    } catch (err) {
      // In case localStorage is not available
      return "en";
    }
  });
  
  const [direction, setDirection] = useState<Direction>(() => {
    // Set direction based on the language
    return language === "ar" ? "rtl" : "ltr";
  });
  
  // Update direction when language changes
  useEffect(() => {
    setDirection(language === "ar" ? "rtl" : "ltr");
    // Save language preference to localStorage
    try {
      localStorage.setItem("language", language);
    } catch (err) {
      // Ignore localStorage errors
    }
    
    // Update document direction and lang attributes
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  // Get translations for current language
  const t = translations[language] as TranslationType;
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, direction, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Financial Data Types
export interface FinancialMetric {
  value: number;
  percentChange: number;
}

export interface FinancialData {
  revenue: FinancialMetric;
  expenses: FinancialMetric;
  profit: FinancialMetric;
  revenueByMonth: { month: string; revenue: number; expenses: number }[];
  profitByMonth: { month: string; profit: number }[];
}

export interface ExpenseCategory {
  id: number;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

// Calendar Types
export interface Appointment {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: number; // in minutes
  description?: string;
  colorCode: string; 
}

// Period Selection
export type PeriodType = 'monthly' | 'quarterly' | 'yearly' | 'custom';

// Language
export type Language = 'en' | 'fr' | 'ar';
export type Direction = 'ltr' | 'rtl';

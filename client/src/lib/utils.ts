import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Language } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, language: Language = 'en'): string {
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };
  
  switch (language) {
    case 'en':
      formatOptions.currency = 'USD';
      return new Intl.NumberFormat('en-US', formatOptions).format(amount);
    case 'fr':
      formatOptions.currency = 'EUR';
      return new Intl.NumberFormat('fr-FR', formatOptions).format(amount);
    case 'ar':
      formatOptions.currency = 'AED';
      return new Intl.NumberFormat('ar-AE', formatOptions).format(amount);
    default:
      formatOptions.currency = 'USD';
      return new Intl.NumberFormat('en-US', formatOptions).format(amount);
  }
}

export function formatPercentage(value: number, language: Language = 'en'): string {
  const sign = value > 0 ? '+' : '';
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  };
  
  return `${sign}${new Intl.NumberFormat(
    language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'ar-AE', 
    formatOptions
  ).format(value / 100)}`;
}

export function getMonthNames(language: Language = 'en'): string[] {
  const formatter = new Intl.DateTimeFormat(
    language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'ar-AE', 
    { month: 'long' }
  );
  
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2023, i, 1);
    return formatter.format(date);
  });
}

export function formatDate(date: Date, language: Language = 'en'): string {
  return new Intl.DateTimeFormat(
    language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'ar-AE',
    { year: 'numeric', month: 'long' }
  ).format(date);
}

export function generateAppointmentColor(id: number): string {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-indigo-100 text-indigo-800',
    'bg-pink-100 text-pink-800',
    'bg-teal-100 text-teal-800',
  ];
  
  return colors[id % colors.length];
}

export const translations = {
  en: {
    title: 'Small Business ERP System',
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    financialDashboard: 'Financial Dashboard',
    financialHealth: 'Financial Health',
    financialHealthScore: 'Financial Health Score',
    viewDetails: 'View Details',
    selectPeriod: 'Select Period',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
    custom: 'Custom',
    refreshData: 'Refresh Data',
    refreshing: 'Refreshing...',
    revenue: 'Revenue',
    expenses: 'Expenses',
    profit: 'Profit',
    lastPeriod: 'last period',
    revenueVsExpenses: 'Revenue vs Expenses',
    profitTrend: 'Profit Trend',
    expenseBreakdown: 'Expense Breakdown',
    expenseCategories: 'Expense Categories',
    topExpenses: 'Top Expenses',
    category: 'Category',
    amount: 'Amount',
    percentage: 'Percentage',
    recommendations: 'Recommendations',
    overallScore: 'Overall Score',
    profitability: 'Profitability',
    liquidity: 'Liquidity',
    efficiency: 'Efficiency',
    expenseManagement: 'Expense Management',
    inventoryHealth: 'Inventory Health',
    accountsReceivable: 'Accounts Receivable',
    appointments: 'Appointments',
    appointmentCalendar: 'Appointment Calendar',
    addAppointment: 'Add Appointment',
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    appointmentTitle: 'Title',
    date: 'Date',
    time: 'Time',
    duration: 'Duration',
    description: 'Description',
    minutes: 'minutes',
    save: 'Save',
    cancel: 'Cancel',
  },
  fr: {
    title: 'Système ERP pour Petites Entreprises',
    dashboard: 'Tableau de Bord',
    calendar: 'Calendrier',
    financialDashboard: 'Tableau de Bord Financier',
    financialHealth: 'Santé Financière',
    financialHealthScore: 'Score de Santé Financière',
    viewDetails: 'Voir les Détails',
    selectPeriod: 'Sélectionner une Période',
    monthly: 'Mensuel',
    quarterly: 'Trimestriel',
    yearly: 'Annuel',
    custom: 'Personnalisé',
    refreshData: 'Actualiser les Données',
    refreshing: 'Actualisation...',
    revenue: 'Revenus',
    expenses: 'Dépenses',
    profit: 'Bénéfice',
    lastPeriod: 'dernière période',
    revenueVsExpenses: 'Revenus vs Dépenses',
    profitTrend: 'Tendance des Bénéfices',
    expenseBreakdown: 'Répartition des Dépenses',
    expenseCategories: 'Catégories de Dépenses',
    topExpenses: 'Principales Dépenses',
    category: 'Catégorie',
    amount: 'Montant',
    percentage: 'Pourcentage',
    recommendations: 'Recommandations',
    overallScore: 'Score Global',
    profitability: 'Rentabilité',
    liquidity: 'Liquidité',
    efficiency: 'Efficacité',
    expenseManagement: 'Gestion des Dépenses',
    inventoryHealth: 'Santé des Stocks',
    accountsReceivable: 'Comptes Clients',
    appointments: 'Rendez-vous',
    appointmentCalendar: 'Calendrier des Rendez-vous',
    addAppointment: 'Ajouter un Rendez-vous',
    sunday: 'Dimanche',
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    appointmentTitle: 'Titre',
    date: 'Date',
    time: 'Heure',
    duration: 'Durée',
    description: 'Description',
    minutes: 'minutes',
    save: 'Enregistrer',
    cancel: 'Annuler',
  },
  ar: {
    title: 'نظام تخطيط موارد المؤسسات للشركات الصغيرة',
    dashboard: 'لوحة المعلومات',
    calendar: 'التقويم',
    financialDashboard: 'لوحة المعلومات المالية',
    financialHealth: 'الصحة المالية',
    financialHealthScore: 'مؤشر الصحة المالية',
    viewDetails: 'عرض التفاصيل',
    selectPeriod: 'اختر الفترة',
    monthly: 'شهري',
    quarterly: 'ربع سنوي',
    yearly: 'سنوي',
    custom: 'مخصص',
    refreshData: 'تحديث البيانات',
    refreshing: 'جاري التحديث...',
    revenue: 'الإيرادات',
    expenses: 'المصروفات',
    profit: 'الربح',
    lastPeriod: 'الفترة السابقة',
    revenueVsExpenses: 'الإيرادات مقابل المصروفات',
    profitTrend: 'اتجاه الربح',
    expenseBreakdown: 'تفصيل المصروفات',
    expenseCategories: 'فئات المصروفات',
    topExpenses: 'أهم المصروفات',
    category: 'الفئة',
    amount: 'المبلغ',
    percentage: 'النسبة المئوية',
    recommendations: 'التوصيات',
    overallScore: 'النتيجة الإجمالية',
    profitability: 'الربحية',
    liquidity: 'السيولة',
    efficiency: 'الكفاءة',
    expenseManagement: 'إدارة النفقات',
    inventoryHealth: 'صحة المخزون',
    accountsReceivable: 'الحسابات المدينة',
    appointments: 'المواعيد',
    appointmentCalendar: 'تقويم المواعيد',
    addAppointment: 'إضافة موعد',
    sunday: 'الأحد',
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    appointmentTitle: 'العنوان',
    date: 'التاريخ',
    time: 'الوقت',
    duration: 'المدة',
    description: 'الوصف',
    minutes: 'دقائق',
    save: 'حفظ',
    cancel: 'إلغاء',
  }
};

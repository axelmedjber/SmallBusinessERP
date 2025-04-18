import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Gauge, TrendingUp, ArrowUpRight, DollarSign, BarChart, Package } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Add translations to your utils/translations
const scoreTranslations = {
  en: {
    financialHealthScore: "Financial Health Score",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
    viewDetails: "View Details",
    hideDetails: "Hide Details",
    recommendations: "Recommendations",
    metrics: "Score Breakdown",
    profitMargin: "Profit Margin",
    revenueGrowth: "Revenue Growth",
    expenseManagement: "Expense Management",
    inventoryHealth: "Inventory Health",
    accountsReceivable: "Accounts Receivable"
  },
  fr: {
    financialHealthScore: "Score de Santé Financière",
    excellent: "Excellent",
    good: "Bon",
    fair: "Moyen",
    poor: "Faible",
    viewDetails: "Voir les Détails",
    hideDetails: "Masquer les Détails",
    recommendations: "Recommandations",
    metrics: "Répartition du Score",
    profitMargin: "Marge Bénéficiaire",
    revenueGrowth: "Croissance du Revenu",
    expenseManagement: "Gestion des Dépenses",
    inventoryHealth: "Santé des Stocks",
    accountsReceivable: "Comptes Clients"
  },
  ar: {
    financialHealthScore: "مؤشر الصحة المالية",
    excellent: "ممتاز",
    good: "جيد",
    fair: "مقبول",
    poor: "ضعيف",
    viewDetails: "عرض التفاصيل",
    hideDetails: "إخفاء التفاصيل",
    recommendations: "التوصيات",
    metrics: "تفصيل النتيجة",
    profitMargin: "هامش الربح",
    revenueGrowth: "نمو الإيرادات",
    expenseManagement: "إدارة المصروفات",
    inventoryHealth: "صحة المخزون",
    accountsReceivable: "الذمم المدينة"
  }
};

// Helper functions for score display
const getScoreColorClass = (score: number): string => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
};

const getScoreBackgroundClass = (score: number): string => {
  if (score >= 80) return "bg-green-100";
  if (score >= 60) return "bg-blue-100";
  if (score >= 40) return "bg-amber-100";
  return "bg-red-100";
};

const getScoreProgressColorClass = (score: number): string => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
};

const getCategoryFromScore = (score: number, lang: "en" | "fr" | "ar"): string => {
  const translations = scoreTranslations[lang];
  if (score >= 80) return translations.excellent;
  if (score >= 60) return translations.good;
  if (score >= 40) return translations.fair;
  return translations.poor;
};

// Metric icon mapping
const MetricIcon = ({ metric }: { metric: string }) => {
  switch (metric) {
    case "profitMargin":
      return <DollarSign className="h-4 w-4" />;
    case "revenueGrowth":
      return <TrendingUp className="h-4 w-4" />;
    case "expenseManagement":
      return <BarChart className="h-4 w-4" />;
    case "inventoryHealth":
      return <Package className="h-4 w-4" />;
    case "accountsReceivable":
      return <ArrowUpRight className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

type FinancialHealthMetric = {
  score: number;
  value: number;
  maxScore: number;
};

type FinancialHealthData = {
  score: number;
  category: string;
  metrics: {
    profitMargin: FinancialHealthMetric;
    revenueGrowth: FinancialHealthMetric;
    expenseManagement: FinancialHealthMetric;
    inventoryHealth: FinancialHealthMetric;
    accountsReceivable: FinancialHealthMetric;
  };
  recommendations: string[];
};

const FinancialHealthScore = () => {
  const { language, t } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const scoreT = scoreTranslations[language as keyof typeof scoreTranslations];
  
  // Fetch financial health data
  const { data, isLoading, error } = useQuery<FinancialHealthData>({
    queryKey: ["/api/financial-health"],
  });
  
  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading financial health data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data) {
    return (
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <h3 className="text-lg font-medium text-gray-900">{scoreT.financialHealthScore}</h3>
            <p className="text-gray-500 mt-2">Unable to load financial health data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const categoryLabel = getCategoryFromScore(data.score, language as "en" | "fr" | "ar");
  
  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Gauge className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">{scoreT.financialHealthScore}</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm"
            >
              {showDetails ? scoreT.hideDetails : scoreT.viewDetails}
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mb-4">
            <div className={cn(
              "flex items-center justify-center rounded-full w-32 h-32 mb-2",
              getScoreBackgroundClass(data.score)
            )}>
              <div className="text-center">
                <div className={cn("text-4xl font-bold", getScoreColorClass(data.score))}>
                  {data.score}
                </div>
                <div className={cn("text-sm font-medium", getScoreColorClass(data.score))}>
                  {categoryLabel}
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <h4 className="font-medium text-gray-800">{scoreT.recommendations}</h4>
              <ul className="list-disc pl-5 space-y-1">
                {data.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-600">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
          
          {showDetails && (
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium text-gray-800 mb-4">{scoreT.metrics}</h4>
              <div className="space-y-4">
                {Object.entries(data.metrics).map(([key, metric]) => (
                  <div key={key} className="flex flex-col space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm font-medium text-gray-700">
                        <MetricIcon metric={key} />
                        <span className="ml-2">
                          {scoreT[key as keyof typeof scoreT]}
                        </span>
                      </div>
                      <div className="text-sm font-medium">
                        {metric.score}/{metric.maxScore}
                      </div>
                    </div>
                    <Progress 
                      value={(metric.score / metric.maxScore) * 100} 
                      className={cn(
                        "h-2 w-full", 
                        getScoreProgressColorClass(Math.round((metric.score / metric.maxScore) * 100))
                      )} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialHealthScore;
import { useLanguage } from "@/hooks/use-language";
import { formatCurrency, formatPercentage, translations } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const FinancialMetricsCards = ({ data }: { data: any }) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  if (!data) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Revenue Card */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">{t.revenue}</h3>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(data.revenue.value, language)}</span>
            <span className={`text-sm font-medium ${data.revenue.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(data.revenue.percentChange, language)} {t.lastPeriod}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Expenses Card */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">{t.expenses}</h3>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(data.expenses.value, language)}</span>
            <span className={`text-sm font-medium ${data.expenses.percentChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(data.expenses.percentChange, language)} {t.lastPeriod}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Profit Card */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">{t.profit}</h3>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(data.profit.value, language)}</span>
            <span className={`text-sm font-medium ${data.profit.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(data.profit.percentChange, language)} {t.lastPeriod}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialMetricsCards;

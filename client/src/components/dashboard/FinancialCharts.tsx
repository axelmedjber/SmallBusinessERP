import { useEffect, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
import { translations, getMonthNames } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area 
} from "recharts";

const FinancialCharts = ({ data }: { data: any }) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  if (!data) return null;
  
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${value / 1000}k`;
    }
    return `$${value}`;
  };
  
  const monthNames = getMonthNames(language);
  
  // Transform data for charts
  const revenueExpensesData = data.revenueByMonth.map((item: any, index: number) => ({
    ...item,
    month: monthNames[index % 12]
  }));
  
  const profitTrendData = data.profitByMonth.map((item: any, index: number) => ({
    ...item,
    month: monthNames[index % 12]
  }));
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Revenue vs Expenses Chart */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-base font-medium text-gray-700 mb-4">{t.revenueVsExpenses}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueExpensesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatYAxis} />
                <Tooltip 
                  formatter={(value) => [`$${value}`, '']}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Bar dataKey="revenue" name={t.revenue} fill="#818cf8" />
                <Bar dataKey="expenses" name={t.expenses} fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Profit Trend Chart */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-base font-medium text-gray-700 mb-4">{t.profitTrend}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={profitTrendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatYAxis} />
                <Tooltip 
                  formatter={(value) => [`$${value}`, t.profit]}
                  labelFormatter={(label) => label}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  name={t.profit} 
                  fill="rgba(16, 185, 129, 0.2)" 
                  stroke="#10b981" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialCharts;

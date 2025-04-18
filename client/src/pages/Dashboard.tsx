import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Dashboard = () => {
  const { language, t } = useLanguage();
  
  return (
    <div className="grid gap-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{t.financialDashboard}</h2>
      </div>
      
      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.revenue}</CardDescription>
            <CardTitle className="text-2xl text-blue-500">$24,500</CardTitle>
            <p className="text-sm text-green-600">+7.2% {t.lastPeriod}</p>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.expenses}</CardDescription>
            <CardTitle className="text-2xl text-red-500">$16,300</CardTitle>
            <p className="text-sm text-red-600">+3.5% {t.lastPeriod}</p>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.profit}</CardDescription>
            <CardTitle className="text-2xl text-green-500">$8,200</CardTitle>
            <p className="text-sm text-green-600">+15.9% {t.lastPeriod}</p>
          </CardHeader>
        </Card>
      </div>
      
      {/* Revenue vs Expenses */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t.revenueVsExpenses}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center bg-gray-100 rounded-md">
            <p className="text-gray-500">Chart visualization will be added here</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Expense Breakdown */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t.expenseBreakdown}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center bg-gray-100 rounded-md">
            <p className="text-gray-500">Pie chart visualization will be added here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

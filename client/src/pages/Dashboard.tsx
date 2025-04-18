import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import FinancialCharts from "@/components/dashboard/FinancialCharts";
import ExpenseAnalysis from "@/components/dashboard/ExpenseAnalysis";
import FinancialDashboard from "@/components/dashboard/FinancialDashboard";
import FinancialHealthScore from "@/components/dashboard/FinancialHealthScore";

const Dashboard = () => {
  const { language, t } = useLanguage();
  
  // Query financial data
  const { data: financialData, isLoading } = useQuery<any>({
    queryKey: ["/api/financial-data", "monthly"],
  });
  
  return (
    <div className="grid gap-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{t.financialDashboard}</h2>
      </div>
      
      {/* Financial Dashboard with Period Selector */}
      <FinancialDashboard />
      
      {/* Financial Health Score and Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Financial Health Score Widget */}
        <div className="md:col-span-1">
          <FinancialHealthScore />
        </div>
        
        {/* Financial Metrics */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      </div>
      
      {/* Charts */}
      {financialData && <FinancialCharts data={financialData} />}
      
      {/* Expense Analysis */}
      <ExpenseAnalysis />
    </div>
  );
};

export default Dashboard;

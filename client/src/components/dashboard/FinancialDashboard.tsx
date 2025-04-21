import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PeriodType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FinancialMetricsCards from "./FinancialMetricsCards";
import FinancialCharts from "./FinancialCharts";
import { queryClient } from "@/lib/queryClient";
import { NetworkErrorContainer, ServerErrorContainer } from "@/components/ui/error-container";

const FinancialDashboard = () => {
  const { language, t } = useLanguage();
  const [period, setPeriod] = useState<PeriodType>("monthly");
  
  const { 
    data: financialData, 
    isLoading,
    error: financialDataError,
    refetch: refetchFinancialData
  } = useQuery({
    queryKey: ["/api/financial-data", period],
  });
  
  const { mutate: refreshData, isPending: isRefreshing, error: refreshError } = useMutation({
    mutationFn: async () => {
      return await fetch(`/api/financial-data/refresh?period=${period}`, {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-data", period] });
    },
  });
  
  const handleRefresh = () => {
    refreshData();
  };
  
  return (
    <section className="mb-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">{t.financialDashboard}</h2>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex flex-col w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.selectPeriod}
            </label>
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as PeriodType)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t.monthly} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">{t.monthly}</SelectItem>
                <SelectItem value="quarterly">{t.quarterly}</SelectItem>
                <SelectItem value="yearly">{t.yearly}</SelectItem>
                <SelectItem value="custom">{t.custom}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="default"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-10 sm:mt-6 w-full sm:w-auto"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">{t.refreshing}</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t.refreshData}</span>
                <span className="sm:hidden">{t.refreshing.split(' ')[0]}</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Financial Metrics Cards and Charts */}
      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <FinancialMetricsCards data={financialData} />
          <FinancialCharts data={financialData} />
        </>
      )}
    </section>
  );
};

export default FinancialDashboard;

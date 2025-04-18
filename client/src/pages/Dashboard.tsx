import { useLanguage } from "@/hooks/use-language";
import ExpenseAnalysis from "@/components/dashboard/ExpenseAnalysis";
import FinancialDashboard from "@/components/dashboard/FinancialDashboard";

const Dashboard = () => {
  const { t } = useLanguage();
  
  return (
    <div className="grid gap-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{t.financialDashboard}</h2>
      </div>
      
      {/* Financial Dashboard with Period Selector */}
      <FinancialDashboard />
      
      {/* Expense Analysis */}
      <ExpenseAnalysis />
    </div>
  );
};

export default Dashboard;

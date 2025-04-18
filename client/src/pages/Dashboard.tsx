import FinancialDashboard from "@/components/dashboard/FinancialDashboard";
import ExpenseAnalysis from "@/components/dashboard/ExpenseAnalysis";

const Dashboard = () => {
  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      <FinancialDashboard />
      <ExpenseAnalysis />
    </main>
  );
};

export default Dashboard;

import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { translations, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface ExpenseItem {
  id: number;
  name: string;
  amount: number;
  percentage: number;
}

const COLORS = [
  '#f97316', // Orange
  '#facc15', // Yellow
  '#84cc16', // Lime
  '#14b8a6', // Teal
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444'  // Red
];

const ExpenseAnalysis = () => {
  const { language } = useLanguage();
  const t = translations[language];
  
  const { data: expensesData, isLoading } = useQuery<ExpenseItem[]>({
    queryKey: ["/api/expenses"],
    initialData: [],
  });
  
  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{t.expenseBreakdown}</h2>
        <div className="h-96 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }
  
  if (!expensesData) return null;
  
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{t.expenseBreakdown}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Category Chart */}
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base font-medium text-gray-700 mb-4">{t.expenseCategories}</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    innerRadius={35}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="name"
                  >
                    {expensesData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value), language), '']}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Top Expenses Table */}
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base font-medium text-gray-700 mb-4">{t.topExpenses}</h3>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">{t.category}</TableHead>
                    <TableHead className="text-right">{t.amount}</TableHead>
                    <TableHead className="text-right">{t.percentage}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expensesData.map((expense: any) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-gray-500 py-2">{expense.name}</TableCell>
                      <TableCell className="text-right text-gray-900 py-2">
                        {formatCurrency(expense.amount, language)}
                      </TableCell>
                      <TableCell className="text-right text-gray-500 py-2">
                        {expense.percentage.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ExpenseAnalysis;

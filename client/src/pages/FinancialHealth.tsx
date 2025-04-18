import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

// Financial health interface
interface FinancialHealthData {
  score: number;
  category: string;
  metrics: {
    profitability: {
      score: number;
      value: number;
      maxScore: number;
    };
    liquidity: {
      score: number;
      value: number;
      maxScore: number;
    };
    efficiency: {
      score: number;
      value: number;
      maxScore: number;
    };
    expenseManagement: {
      score: number;
      value: number;
      maxScore: number;
    };
    inventoryHealth: {
      score: number; 
      value: number;
      maxScore: number;
    };
    accountsReceivable: {
      score: number;
      value: number;
      maxScore: number;
    };
  };
  recommendations: string[];
}

const FinancialHealth = () => {
  const { t, language } = useLanguage();
  
  // Fetch financial health data
  const { data: healthData, isLoading } = useQuery<FinancialHealthData>({
    queryKey: ['/api/financial-health'],
    queryFn: async () => {
      const response = await fetch('/api/financial-health');
      if (!response.ok) {
        throw new Error('Failed to fetch financial health data');
      }
      return await response.json();
    }
  });
  
  // Helper function to get color based on score ratio
  const getScoreColor = (score: number, maxScore: number) => {
    const ratio = score / maxScore;
    if (ratio >= 0.8) return 'text-green-600';
    if (ratio >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Helper function to get background color based on score ratio
  const getScoreBgColor = (score: number, maxScore: number) => {
    const ratio = score / maxScore;
    if (ratio >= 0.8) return 'bg-green-100';
    if (ratio >= 0.6) return 'bg-yellow-100';
    return 'bg-red-100';
  };
  
  // Helper function to get status icon
  const getStatusIcon = (score: number, maxScore: number) => {
    const ratio = score / maxScore;
    if (ratio >= 0.8) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (ratio >= 0.6) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };
  
  // Helper function to format percentage
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  // Helper function to get category description
  const getCategoryDescription = (category: string) => {
    switch (category.toLowerCase()) {
      case 'excellent':
        return 'Your business is in excellent financial health. Keep up the good work!';
      case 'good':
        return 'Your business is in good financial health, but there\'s room for improvement.';
      case 'fair':
        return 'Your business is in fair financial health. Consider addressing the highlighted areas.';
      case 'poor':
        return 'Your business is in poor financial health. Urgent action is needed.';
      default:
        return '';
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  if (!healthData) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-xl font-medium">Failed to load financial health data</h3>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { score, category, metrics, recommendations } = healthData;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Financial Health Score</h2>
      </div>
      
      {/* Main Score Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Overall Financial Health</CardTitle>
          <CardDescription>{getCategoryDescription(category)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0 md:mr-6">
              <div className="text-6xl font-bold mb-2 flex items-center">
                {score}
                <span className="text-lg ml-2 font-normal text-gray-500">/ 100</span>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                category === 'Excellent' ? 'bg-green-100 text-green-800' :
                category === 'Good' ? 'bg-blue-100 text-blue-800' :
                category === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {category}
              </div>
            </div>
            <div className="flex-1">
              <Progress value={score} className="h-3 mb-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Detailed Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profitability */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Profitability</CardTitle>
              {getStatusIcon(metrics.profitability.score, metrics.profitability.maxScore)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">
                <span className={getScoreColor(metrics.profitability.score, metrics.profitability.maxScore)}>
                  {metrics.profitability.score}
                </span>
                <span className="text-gray-500"> / {metrics.profitability.maxScore}</span>
              </div>
              <div className="text-sm">
                Profit Margin: {formatPercentage(metrics.profitability.value)}
              </div>
            </div>
            <Progress 
              value={(metrics.profitability.score / metrics.profitability.maxScore) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>
        
        {/* Liquidity */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Liquidity</CardTitle>
              {getStatusIcon(metrics.liquidity.score, metrics.liquidity.maxScore)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">
                <span className={getScoreColor(metrics.liquidity.score, metrics.liquidity.maxScore)}>
                  {metrics.liquidity.score}
                </span>
                <span className="text-gray-500"> / {metrics.liquidity.maxScore}</span>
              </div>
              <div className="text-sm">
                Current Ratio: {metrics.liquidity.value.toFixed(2)}
              </div>
            </div>
            <Progress 
              value={(metrics.liquidity.score / metrics.liquidity.maxScore) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>
        
        {/* Efficiency */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Operational Efficiency</CardTitle>
              {getStatusIcon(metrics.efficiency.score, metrics.efficiency.maxScore)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">
                <span className={getScoreColor(metrics.efficiency.score, metrics.efficiency.maxScore)}>
                  {metrics.efficiency.score}
                </span>
                <span className="text-gray-500"> / {metrics.efficiency.maxScore}</span>
              </div>
              <div className="text-sm">
                Asset Turnover: {metrics.efficiency.value.toFixed(2)}x
              </div>
            </div>
            <Progress 
              value={(metrics.efficiency.score / metrics.efficiency.maxScore) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>
        
        {/* Expense Management */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Expense Management</CardTitle>
              {getStatusIcon(metrics.expenseManagement.score, metrics.expenseManagement.maxScore)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">
                <span className={getScoreColor(metrics.expenseManagement.score, metrics.expenseManagement.maxScore)}>
                  {metrics.expenseManagement.score}
                </span>
                <span className="text-gray-500"> / {metrics.expenseManagement.maxScore}</span>
              </div>
              <div className="text-sm">
                Expense Ratio: {formatPercentage(metrics.expenseManagement.value)}
              </div>
            </div>
            <Progress 
              value={(metrics.expenseManagement.score / metrics.expenseManagement.maxScore) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>
        
        {/* Inventory Health */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Inventory Health</CardTitle>
              {getStatusIcon(metrics.inventoryHealth.score, metrics.inventoryHealth.maxScore)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">
                <span className={getScoreColor(metrics.inventoryHealth.score, metrics.inventoryHealth.maxScore)}>
                  {metrics.inventoryHealth.score}
                </span>
                <span className="text-gray-500"> / {metrics.inventoryHealth.maxScore}</span>
              </div>
              <div className="text-sm">
                Stock Level Health: {formatPercentage(metrics.inventoryHealth.value)}
              </div>
            </div>
            <Progress 
              value={(metrics.inventoryHealth.score / metrics.inventoryHealth.maxScore) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>
        
        {/* Accounts Receivable */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Accounts Receivable</CardTitle>
              {getStatusIcon(metrics.accountsReceivable.score, metrics.accountsReceivable.maxScore)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">
                <span className={getScoreColor(metrics.accountsReceivable.score, metrics.accountsReceivable.maxScore)}>
                  {metrics.accountsReceivable.score}
                </span>
                <span className="text-gray-500"> / {metrics.accountsReceivable.maxScore}</span>
              </div>
              <div className="text-sm">
                Overdue Ratio: {formatPercentage(metrics.accountsReceivable.value)}
              </div>
            </div>
            <Progress 
              value={(metrics.accountsReceivable.score / metrics.accountsReceivable.maxScore) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc pl-5">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700">{recommendation}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialHealth;
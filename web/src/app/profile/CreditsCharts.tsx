import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip
} from 'recharts';
import { Expand } from 'lucide-react';
import { getCreditHistory } from '@/lib/api_service';
import { CreditLog } from '@/types';

interface ChartData {
  name: string;
  value: number;
  date: string;
}

interface CreditsChartsProps {
  className?: string;
}

export const CreditsCharts = ({ className }: CreditsChartsProps) => {
  const [spendData, setSpendData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDaySpend, setLastDaySpend] = useState(0);
  const [lastWeekSpend, setLastWeekSpend] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCreditsData();
    }
  }, [user]);

  const fetchCreditsData = async () => {
    if (!user || !user.idToken) return;

    setIsLoading(true);
    try {
      const {history} = await getCreditHistory(user.idToken);
      if (history) {
        processCreditsData(history);
      } else {
        console.error('Failed to fetch credits data');
      }
    } catch (error) {
      console.error('Error fetching credits data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processCreditsData = (credits: CreditLog[]) => {
    // Sort by date
    const sortedCredits = [...credits].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Group by day for the chart
    const dailySpend: Record<string, number> = {};
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let daySpendTotal = 0;
    let weekSpendTotal = 0;

    sortedCredits.forEach(transaction => {
      const date = new Date(transaction.created_at);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Only process completion transactions for spend data
      if (transaction.tx_reason === 'completion' && transaction.tx_credits < 0) {
        // Add to daily spend
        if (!dailySpend[dateKey]) {
          dailySpend[dateKey] = 0;
        }
        const absCredits = Math.abs(transaction.tx_credits);
        dailySpend[dateKey] += absCredits;
        
        // Calculate totals for last day and week
        if (date >= oneDayAgo) {
          daySpendTotal += absCredits;
        }
        if (date >= oneWeekAgo) {
          weekSpendTotal += absCredits;
        }
      }
    });

    // Convert to chart data format
    const spendChartData = Object.entries(dailySpend).map(([date, value]) => ({
      name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(value.toFixed(4)),
      date
    }));

    // Take last 30 days of data
    const last30DaysSpend = spendChartData.slice(-30);
    
    setSpendData(last30DaysSpend);
    setLastDaySpend(parseFloat(daySpendTotal.toFixed(4)));
    setLastWeekSpend(parseFloat(weekSpendTotal.toFixed(4)));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 shadow-sm rounded-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {payload[0].name === 'value' ? '$' : ''}{payload[0].value}
            {payload[0].name !== 'value' ? ' tokens' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      {/* Spend Chart */}
      <div className={
        "bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:text-gray-900 shadow-sm hover:shadow-lg cursor-pointer transition-colors"
      }>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Spend</h3>
          <Expand className="w-4 h-4" />
        </div>
        
        <div className="h-64">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : spendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-500 dark:text-gray-400">
              <p className="text-sm">No data available</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last day</p>
            <p className="text-lg font-medium">${lastDaySpend}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last week</p>
            <p className="text-lg font-medium">${lastWeekSpend}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

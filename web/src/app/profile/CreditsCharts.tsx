import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Expand } from 'lucide-react';
import { formatCredits } from '@/lib/utils';
import { createApiClient } from '@/lib/api_client';
import { CreditLog } from '@the-agent/shared';

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
      const { history } = await createApiClient(user.idToken).getCreditHistory({});
      // console.log('---history:', history);
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
    const sortedCredits = [...credits].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    // Group by day for the chart
    const dailySpend: Record<string, number> = {};

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let daySpendTotal = 0;
    let weekSpendTotal = 0;

    sortedCredits.forEach((transaction) => {
      const date = new Date(transaction.created_at);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      // Only process debit transactions for spend data
      if (transaction.tx_type === 'credit') {
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
      date,
    }));

    // Take last 30 days of data
    const last30DaysSpend = spendChartData.slice(-30);

    setSpendData(last30DaysSpend);
    setLastDaySpend(parseFloat(daySpendTotal.toFixed(4)));
    setLastWeekSpend(parseFloat(weekSpendTotal.toFixed(4)));
  };

  return (
    <div className={className}>
      {/* Spend Chart */}
      <div
        className={
          'bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:text-gray-900 shadow-sm hover:shadow-lg cursor-pointer transition-colors'
        }
      >
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
                <Tooltip
                  formatter={(value: number) => [`$${formatCredits(value, 6)}`, 'Credits']}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" fill="#F6465D" radius={[4, 4, 0, 0]} />
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
            <p className="text-lg font-medium">${formatCredits(lastDaySpend, 2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last week</p>
            <p className="text-lg font-medium">${formatCredits(lastWeekSpend, 2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

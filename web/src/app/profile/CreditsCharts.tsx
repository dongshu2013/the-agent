import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { createApiClient } from '@/lib/api_client';
import { CreditDailyItem } from '@the-agent/shared';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface ChartData {
  name: string;
  value: number;
  date: string;
}

interface CreditsChartsProps {
  className?: string;
}

const processCreditsData = (dailyCredits: CreditDailyItem[]) => {
  // Sort by date
  const sortedCredits = [...dailyCredits].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let daySpendTotal = 0;
  let weekSpendTotal = 0;

  // Calculate totals for last day and week
  sortedCredits.forEach(item => {
    const date = new Date(item.date);
    const absCredits = Math.abs(item.credits);

    if (date >= oneDayAgo) {
      daySpendTotal += absCredits;
    }
    if (date >= oneWeekAgo) {
      weekSpendTotal += absCredits;
    }
  });

  // Convert to chart data format
  const spendChartData = sortedCredits.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: parseFloat(item.credits.toFixed(4)),
    date: item.date,
  }));

  // Take last 30 days of data
  const last30DaysSpend = spendChartData.slice(-30);
  return {
    last30DaysSpend,
    daySpendTotal,
    weekSpendTotal,
  };
};

export const CreditsCharts = ({ className }: CreditsChartsProps) => {
  const [spendData, setSpendData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDaySpend, setLastDaySpend] = useState(0);
  const [lastWeekSpend, setLastWeekSpend] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCreditsData = async () => {
      setIsLoading(true);
      try {
        // Get daily credit usage data
        const { data } = await createApiClient(user.idToken).getCreditDaily({});
        if (data) {
          const result = processCreditsData(data);
          setSpendData(result.last30DaysSpend);
          setLastDaySpend(result.daySpendTotal);
          setLastWeekSpend(result.weekSpendTotal);
        } else {
          console.error('Failed to fetch credits data');
        }
      } catch (error) {
        console.error('Error fetching credits data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.idToken) {
      fetchCreditsData();
    }
  }, [user]);

  return (
    <div className={className}>
      {/* Spend Chart */}
      <div
        className={
          'bg-white p-4 rounded-lg border border-gray-200 hover:text-gray-900 shadow-sm transition-colors'
        }
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Spend</h3>
          {/* <Expand className="w-4 h-4" /> */}
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
                  formatter={(value: number) => [
                    formatCurrency(value, { maximumFractionDigits: 6 }),
                    'Credits',
                  ]}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" fill="#333333CC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-500 dark:text-gray-400">
              <Image
                src="/empty.png"
                alt="No data"
                width={120}
                height={120}
                className="mb-2 opacity-70"
              />
              <p className="text-sm">No data available</p>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last day</p>
            <p className="text-lg font-medium">
              {formatCurrency(lastDaySpend, { maximumFractionDigits: 6 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last week</p>
            <p className="text-lg font-medium">
              {formatCurrency(lastWeekSpend, { maximumFractionDigits: 6 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

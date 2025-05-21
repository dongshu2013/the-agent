'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { createApiClient } from '@/lib/api_client';
import {
  CreditLog,
  TransactionReason,
  TransactionReasonSchema,
  TransactionType,
  TransactionTypeSchema,
} from '@the-agent/shared';
import { formatCurrency } from '@/lib/utils';

interface FilterOptions {
  models: string[];
  txTypes: TransactionType[];
  txReasons: TransactionReason[];
}

export const CreditsTable = () => {
  const [credits, setCredits] = useState<CreditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    models: [],
    txTypes: [] as TransactionType[],
    txReasons: [] as TransactionReason[],
  });

  // Filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedTxType, setSelectedTxType] = useState<TransactionType | ''>('');
  const [selectedTxReason, setSelectedTxReason] = useState<TransactionReason | ''>('');

  const { user } = useAuth();

  useEffect(() => {
    const fetchCreditsData = async () => {
      setIsLoading(true);
      try {
        const { history } = await createApiClient(user.idToken).getCreditHistory({
          startDate,
          endDate,
          model: selectedModel,
          txType: selectedTxType as TransactionType,
          txReason: selectedTxReason as TransactionReason,
        });

        setCredits(history || []);

        // Extract unique values for filter options from the history data
        if (history && history.length > 0) {
          const models = Array.from(new Set(history.map(entry => entry.model).filter(Boolean)));
          const txTypes = Array.from(
            new Set(history.map(entry => entry.tx_type))
          ) as TransactionType[];
          const txReasons = Array.from(
            new Set(history.map(entry => entry.tx_reason))
          ) as TransactionReason[];

          setFilterOptions({
            models,
            txTypes,
            txReasons,
          });
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
  }, [user, startDate, endDate, selectedModel, selectedTxType, selectedTxReason]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return dateString;
    }
  };

  const formatTxReason = (reason: TransactionReason) => {
    switch (reason) {
      case TransactionReasonSchema.enum.new_user:
        return 'New User';
      case TransactionReasonSchema.enum.order_pay:
        return 'Order Payment';
      case TransactionReasonSchema.enum.system_add:
        return 'System Added';
      case TransactionReasonSchema.enum.completion:
        return 'Completion';
      case TransactionReasonSchema.enum.coupon_code:
        return 'Coupon Redeem';
      default:
        return reason;
    }
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedModel('');
    setSelectedTxType('');
    setSelectedTxReason('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
      {/* Filter Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-600 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-600 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Model
            </label>
            <select
              id="model"
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-600 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Models</option>
              {filterOptions.models.map(model => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="transType"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Transaction Reason
            </label>
            <select
              id="transReason"
              value={selectedTxReason}
              onChange={e => setSelectedTxReason(e.target.value as TransactionReason | '')}
              className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-600 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Types</option>
              {filterOptions.txReasons.map(reason => (
                <option key={reason} value={reason}>
                  {formatTxReason(reason)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-none">
            <button
              onClick={resetFilters}
              className="px-4 h-9 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Reason
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Model
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Credits
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : credits.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No credits data found
                </td>
              </tr>
            ) : (
              credits.map(credit => (
                <tr key={credit.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(credit.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatTxReason(credit.tx_reason as TransactionReason)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {credit.model || '-'}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      credit.tx_type === TransactionTypeSchema.enum.credit
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {credit.tx_type === TransactionTypeSchema.enum.credit ? '-' : '+'}
                    {formatCurrency(credit.tx_credits, { maximumFractionDigits: 6 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination could be added here in the future */}
    </div>
  );
};

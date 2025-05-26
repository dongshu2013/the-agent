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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const { user } = useAuth();

  useEffect(() => {
    const fetchCreditsData = async () => {
      setIsLoading(true);
      try {
        const { history, total } = await createApiClient(user.idToken).getCreditHistory({
          startDate,
          endDate,
          model: selectedModel,
          txType: selectedTxType as TransactionType,
          txReason: selectedTxReason as TransactionReason,
          limit: pageSize,
          offset: (page - 1) * pageSize,
        });

        setCredits(history || []);
        setTotal(total || 0);

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
  }, [user, startDate, endDate, selectedModel, selectedTxType, selectedTxReason, page, pageSize]);

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
    setPage(1);
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
              className="px-4 h-9 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
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

      {/* Pagination */}
      <div className="flex flex-wrap justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">{Math.min((page - 1) * pageSize + 1, total)}</span>{' '}
          to <span className="font-medium">{Math.min(page * pageSize, total)}</span> of{' '}
          <span className="font-medium">{total}</span> results
        </div>

        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          {/* Page size selector */}
          <div className="flex items-center">
            <label htmlFor="pageSize" className="mr-2 text-sm text-gray-600 dark:text-gray-400">
              Show
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded-md border border-gray-300 dark:border-gray-600 px-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">per page</span>
          </div>
        </div>

        <div className="flex items-center justify-center mt-2 sm:mt-0 w-full sm:w-auto">
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            {/* First page button */}
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed dark:bg-gray-800 dark:ring-gray-700 dark:hover:bg-gray-700 dark:text-gray-400"
            >
              <span className="sr-only">First page</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M13.293 6.293a1 1 0 011.414 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M7.293 6.293a1 1 0 011.414 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Previous page button */}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed dark:bg-gray-800 dark:ring-gray-700 dark:hover:bg-gray-700 dark:text-gray-400"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Current page indicator */}
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600">
              {page} of {Math.max(1, Math.ceil(total / pageSize))}
            </span>

            {/* Next page button */}
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= total}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed dark:bg-gray-800 dark:ring-gray-700 dark:hover:bg-gray-700 dark:text-gray-400"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Last page button */}
            <button
              onClick={() => setPage(Math.max(1, Math.ceil(total / pageSize)))}
              disabled={page * pageSize >= total}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed dark:bg-gray-800 dark:ring-gray-700 dark:hover:bg-gray-700 dark:text-gray-400"
            >
              <span className="sr-only">Last page</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M6.707 14.707a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M12.707 14.707a1 1 0 01-1.414-1.414L14.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

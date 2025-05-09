"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionType } from '@/lib/constants';
import { format } from 'date-fns';

interface CreditTransaction {
  id: string;
  amount: number | null;
  trans_credits: number;
  trans_type: TransactionType;
  created_at: string;
  model?: string | null;
  conversation_id?: string | null;
}

interface FilterOptions {
  models: string[];
  transTypes: TransactionType[];
}

export const CreditsTable = () => {
  const [credits, setCredits] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    models: [],
    transTypes: [] as TransactionType[]
  });
  
  // Filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedTransType, setSelectedTransType] = useState<TransactionType | ''>('');
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCreditsData();
    }
  }, [user, startDate, endDate, selectedModel, selectedTransType]);

  const fetchCreditsData = async () => {
    if (!user || !user.idToken) return;
    
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedModel) params.append('model', selectedModel);
      if (selectedTransType) params.append('transType', selectedTransType);
      
      const queryString = params.toString();
      const url = `/api/credits${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.idToken}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits || []);
        setFilterOptions(data.filters || { models: [], transTypes: [] });
      } else {
        console.error('Failed to fetch credits data');
      }
    } catch (error) {
      console.error('Error fetching credits data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch (e) {
      return dateString;
    }
  };

  const formatTransType = (type: TransactionType) => {
    switch (type) {
      case 'new_user':
        return 'New User';
      case 'order_pay':
        return 'Order Payment';
      case 'system_add':
        return 'System Added';
      case 'completion':
        return 'Completion';
      default:
        return type;
    }
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedModel('');
    setSelectedTransType('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
      {/* Filter Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-600 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="flex-1">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-600 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="flex-1">
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model
            </label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-600 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Models</option>
              {filterOptions.models.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label htmlFor="transType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction Type
            </label>
            <select
              id="transType"
              value={selectedTransType}
              onChange={(e) => setSelectedTransType(e.target.value as TransactionType | '')}
              className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-600 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Types</option>
              {filterOptions.transTypes.map((type) => (
                <option key={type} value={type}>{formatTransType(type)}</option>
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Model
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No credits data found
                </td>
              </tr>
            ) : (
              credits.map((credit) => (
                <tr key={credit.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(credit.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatTransType(credit.trans_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {credit.model || '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${Number(credit.trans_credits) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {Number(credit.trans_credits) >= 0 ? '+' : ''}{Number(credit.trans_credits).toFixed(6)}
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

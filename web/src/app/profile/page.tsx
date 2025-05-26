'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RefreshCw } from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { CouponCodeModal } from './CouponCodeModal';
import { CreditsCharts } from './CreditsCharts';
import { CreditsTable } from './CreditsTable';
import { TelegramStats } from '@the-agent/shared';
import { createApiClient } from '@/lib/api_client';
import { formatCurrency } from '@/lib/utils';

export default function ProfilePage() {
  const { user, loading, signOut, rotateApiKey, toggleApiKey, refreshUserData } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [telegramStats, setTelegramStats] = useState<TelegramStats | null>(null);
  const [isLoadingTelegramStats, setIsLoadingTelegramStats] = useState(false);
  const router = useRouter();
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [redeemCouponOpen, setRedeemCouponOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch Telegram stats when user is loaded
  useEffect(() => {
    const fetchTelegramStats = async () => {
      if (!user || !user.idToken) return;
      setIsLoadingTelegramStats(true);
      try {
        const data = await createApiClient(user.idToken).getTelegramStats();
        setTelegramStats(data);
      } catch (error) {
        console.error('Error fetching Telegram stats:', error);
      } finally {
        setIsLoadingTelegramStats(false);
      }
    };
    if (user) {
      fetchTelegramStats();
    }
  }, [user]);

  const handleCopyApiKey = async () => {
    if (user?.apiKey) {
      await navigator.clipboard.writeText(user.apiKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleRotateApiKey = async () => {
    if (user) {
      setIsRotating(true);
      try {
        await rotateApiKey();
      } catch (error) {
        console.error('Error rotating API key:', error);
      } finally {
        setIsRotating(false);
      }
    }
  };

  const handleToggleApiKey = async () => {
    if (user) {
      setIsToggling(true);
      try {
        await toggleApiKey(!user.apiKeyEnabled);
      } catch (error) {
        console.error('Error toggling API key:', error);
      } finally {
        setIsToggling(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Don't render the page if there's no user and we're not loading
  if (!user) {
    return null; // This will show nothing while the redirect happens in the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center gap-2.5">
              <Image src="/mysta-logo-brand-beta.png" alt="Mysta Logo" width={128} height={32} />
            </div>
            <span className="text-xl font-semibold text-black dark:text-white ml-4">Dashboard</span>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-md cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section - Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Left Column - User Profile and Credits Header in a single card */}
          <div className="lg:w-1/3 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <div className="flex flex-col h-full">
              {/* User Profile Section - 1/3 height */}
              <div className="p-6" style={{ height: '33%' }}>
                <div className="flex flex-col items-center">
                  {user?.photoURL ? (
                    <div className="w-20 h-20 overflow-hidden rounded-full mb-3">
                      <Image
                        src={user.photoURL}
                        alt="User Profile"
                        width={80}
                        height={80}
                        className="rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 mb-3">
                      <span className="text-3xl text-gray-500 dark:text-gray-400">
                        {user?.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white text-center">
                    {user?.displayName || 'User'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-center">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Credits Header Card - 2/3 height with background image */}
              <div className="p-4 flex-grow" style={{ height: '67%' }}>
                <div className="relative rounded-lg overflow-hidden h-full">
                  {/* Background image for Credits section only */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(/dashboard-bg.png)' }}
                  ></div>

                  <div className="relative z-10 h-full flex flex-col p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-white">Credits</h3>
                      <button
                        onClick={async () => {
                          setIsRefreshing(true);
                          try {
                            await refreshUserData();
                          } catch (error) {
                            console.error('Error refreshing data:', error);
                          } finally {
                            setIsRefreshing(false);
                          }
                        }}
                        className="text-white hover:text-gray-200 transition-colors cursor-pointer"
                        disabled={isRefreshing}
                      >
                        <RefreshCw size={18} className={`${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    <div className="flex-grow flex flex-col justify-center items-center">
                      <p className="text-4xl font-bold text-white mb-6">
                        {formatCurrency(user.balance, { maximumFractionDigits: 2 })}
                      </p>
                      <div className="flex space-x-3 w-full">
                        <button
                          onClick={() => setBuyCreditsOpen(true)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-800 bg-white rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          Recharge
                        </button>
                        <button
                          onClick={() => setRedeemCouponOpen(true)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-800 bg-opacity-50 border border-gray-600 rounded-md hover:opacity-70 transition-colors cursor-pointer"
                        >
                          Coupon
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right Column - API Key and Data Sources with adjusted heights */}
          <div className="lg:w-2/3 flex flex-col h-full gap-4">
            {/* API Key Section - 1/3 height */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden h-full">
              <div className="border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Your API Key
                  </h3>
                  <div className="flex items-center">
                    <span
                      className={`mr-2 text-sm ${
                        user.apiKeyEnabled ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {user.apiKeyEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={handleToggleApiKey}
                      disabled={isToggling}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        user.apiKeyEnabled ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          user.apiKeyEnabled ? 'translate-x-6' : 'translate-x-1'
                        } ${isToggling ? 'opacity-50' : ''}`}
                      />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Use this API key to authenticate requests to the Mysta API.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      readOnly
                      value={user?.apiKeyEnabled ? user?.apiKey || '' : '••••••••••••••••••••••••'}
                      className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md ${
                        user?.apiKeyEnabled
                          ? 'bg-gray-50 dark:bg-gray-700'
                          : 'bg-gray-100 dark:bg-gray-800'
                      } text-gray-900 dark:text-gray-100`}
                      disabled={!user?.apiKeyEnabled}
                    />
                    {user?.apiKeyEnabled && (
                      <button
                        onClick={handleCopyApiKey}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                        aria-label="Copy API key"
                      >
                        {isCopied ? (
                          <span className="text-green-500">Copied!</span>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleRotateApiKey}
                    disabled={isRotating || !user?.apiKeyEnabled}
                    className={`px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:opacity-70 transition-opacity cursor-pointer ${
                      isRotating || !user?.apiKeyEnabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isRotating ? 'Rotating...' : 'Rotate Key'}
                  </button>
                </div>
              </div>
            </div>
            {/* Data Sources Section - 2/3 height */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden h-full">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Manage Your Data
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Connect your data sources to enhance your Mysta experience
                  </p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-3 gap-8">
                    {/* Telegram Data Source */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 mb-4 overflow-hidden rounded-full flex items-center justify-center">
                        <Image
                          src="/tg-logo.png"
                          alt="Telegram Logo"
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        Telegram
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                        {telegramStats ? (
                          <>
                            {telegramStats.total_dialogs} chats,{' '}
                            {telegramStats.total_messages.toLocaleString()} messages
                          </>
                        ) : isLoadingTelegramStats ? (
                          'Loading stats...'
                        ) : (
                          'No data has been imported yet...'
                        )}
                      </p>
                      <button
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-opacity cursor-pointer"
                        onClick={() => {
                          const baseUrl = process.env.NEXT_PUBLIC_TG_WEBAPP_URL || '#';
                          const url = new URL(baseUrl);

                          // Add required user parameters
                          if (user.apiKey) {
                            url.searchParams.set('apiKey', user.apiKey);
                          }
                          if (user.displayName) {
                            url.searchParams.set(
                              'displayName',
                              encodeURIComponent(user.displayName)
                            );
                          }
                          if (user.photoURL) {
                            url.searchParams.set('photoURL', encodeURIComponent(user.photoURL));
                          }

                          // Open in new tab with proper security attributes
                          const newWindow = window.open(url.toString(), '_blank');
                          if (newWindow) {
                            newWindow.opener = null; // Prevent reverse tabnabbing
                          }
                        }}
                      >
                        Import Telegram Data
                      </button>
                    </div>

                    {/* Twitter Data Source */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 mb-4 overflow-hidden rounded-full flex items-center justify-center">
                        <Image
                          src="/x-logo.png"
                          alt="X Logo"
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">X</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                        No data has been imported yet...
                      </p>
                      <button
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-md cursor-not-allowed"
                        disabled
                      >
                        Coming Soon
                      </button>
                    </div>

                    {/* Instagram Data Source */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 mb-4 overflow-hidden rounded-full flex items-center justify-center">
                        <Image
                          src="/ins-logo.png"
                          alt="Instagram Logo"
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        Instagram
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                        No data has been imported yet...
                      </p>
                      <button
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-md cursor-not-allowed"
                        disabled
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Credits Section with Charts and Table */}
        <div className="mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          {/* Credits Charts */}
          <div className="p-6">
            <CreditsCharts />
          </div>

          {/* Credits Table */}
          <div className="px-6 pb-6">
            <CreditsTable />
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Mysta. All rights reserved.
      </footer>

      {/* Modals */}
      <PaymentModal isOpen={buyCreditsOpen} onClose={() => setBuyCreditsOpen(false)} />
      <CouponCodeModal isOpen={redeemCouponOpen} onClose={() => setRedeemCouponOpen(false)} />
    </div>
  );
}

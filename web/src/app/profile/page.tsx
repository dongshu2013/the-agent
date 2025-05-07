"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { PaymentModal } from "./PaymentModal";

export default function ProfilePage() {
  const { user, loading, signOut, rotateApiKey, toggleApiKey } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [telegramStats, setTelegramStats] = useState<{ channels_count: number; messages_count: number } | null>(null);
  const [isLoadingTelegramStats, setIsLoadingTelegramStats] = useState(false);
  const router = useRouter();
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Fetch Telegram stats when user is loaded
  useEffect(() => {
    const fetchTelegramStats = async () => {
      if (user?.apiKey && user?.apiKeyEnabled) {
        setIsLoadingTelegramStats(true);
        try {
          const response = await fetch('/api/tg/stats', {
            headers: {
              'Authorization': `Bearer ${user.apiKey}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setTelegramStats(data);
          } else {
            console.error('Failed to fetch Telegram stats');
          }
        } catch (error) {
          console.error('Error fetching Telegram stats:', error);
        } finally {
          setIsLoadingTelegramStats(false);
        }
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
        console.error("Error rotating API key:", error);
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
        console.error("Error toggling API key:", error);
      } finally {
        setIsToggling(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/mysta-logo.png"
              alt="Mysta Agent Logo"
              width={40}
              height={40}
              className="mr-3"
            />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Mysta Agent Dashboard
            </h1>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt="Profile"
                width={48}
                height={48}
                className="rounded-full mr-4"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white mr-4">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {user?.displayName || "User"}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Your API Key
              </h3>
              <div className="flex items-center">
                <span
                  className={`mr-2 text-sm ${
                    user.apiKeyEnabled ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {user.apiKeyEnabled ? "Enabled" : "Disabled"}
                </span>
                <button
                  onClick={handleToggleApiKey}
                  disabled={isToggling}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    user.apiKeyEnabled ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      user.apiKeyEnabled ? "translate-x-6" : "translate-x-1"
                    } ${isToggling ? "opacity-50" : ""}`}
                  />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Use this API key to authenticate requests to the Mysta Agent API.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  readOnly
                  value={
                    user?.apiKeyEnabled
                      ? user?.apiKey || ""
                      : "••••••••••••••••••••••••"
                  }
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md ${
                    user?.apiKeyEnabled
                      ? "bg-gray-50 dark:bg-gray-700"
                      : "bg-gray-100 dark:bg-gray-800"
                  } text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500`}
                  disabled={!user?.apiKeyEnabled}
                />
                {user?.apiKeyEnabled && (
                  <button
                    onClick={handleCopyApiKey}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isRotating || !user?.apiKeyEnabled
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isRotating ? "Rotating..." : "Rotate Key"}
              </button>
            </div>
          </div>

          {/* Credits Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Your Credits
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Manage your credits balance and purchases
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 gap-4">
                <h3>Current Balance</h3>
                <div className="font-bold">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <span>${parseFloat(user.credits).toFixed(2)}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setBuyCreditsOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Buy Credits
              </button>
            </div>

            <PaymentModal
              isOpen={buyCreditsOpen}
              onClose={() => setBuyCreditsOpen(false)}
              onSuccess={() => {
                setBuyCreditsOpen(false);
              }}
            />
          </div>
        </div>

        {/* Data Source Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Manage Your Data
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Connect your data sources to enhance your Mysta Agent experience
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
                  {isLoadingTelegramStats ? (
                    "Loading Telegram data..."
                  ) : telegramStats && telegramStats.channels_count > 0 ? (
                    `${telegramStats.channels_count} chats imported, ${telegramStats.messages_count} messages imported`
                  ) : (
                    "No data has been imported yet..."
                  )}
                </p>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => window.open(process.env.NEXT_PUBLIC_TG_WEBAPP_URL || '#', '_blank')}
                >
                  Import Telegram Data
                </button>
              </div>
              
              {/* Twitter Data Source */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4 overflow-hidden rounded-full flex items-center justify-center">
                  <Image
                    src="/tw-logo.png"
                    alt="Twitter Logo"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  Twitter
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
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        {new Date().getFullYear()} Mysta Agent. All rights reserved.
      </footer>
    </div>
  );
}

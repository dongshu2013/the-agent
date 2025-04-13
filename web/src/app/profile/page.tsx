'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, loading, signOut, rotateApiKey, toggleApiKey } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Agent Dashboard</h1>
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
            {user?.photoURL && (
              <Image
                src={user.photoURL}
                alt="Profile"
                width={48}
                height={48}
                className="rounded-full mr-4"
              />
            )}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {user?.displayName || 'User'}
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
                <span className={`mr-2 text-sm ${user.apiKeyEnabled ? 'text-green-500' : 'text-red-500'}`}>
                  {user.apiKeyEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={handleToggleApiKey}
                  disabled={isToggling}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    user.apiKeyEnabled ? 'bg-blue-600' : 'bg-gray-200'
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
              Use this API key to authenticate requests to the AI Agent API.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  readOnly
                  value={user?.apiKeyEnabled ? user?.apiKey || '' : '••••••••••••••••••••••••'}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md ${
                    user?.apiKeyEnabled ? 'bg-gray-50 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              <button
                onClick={handleRotateApiKey}
                disabled={isRotating || !user?.apiKeyEnabled}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isRotating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Rotating...
                  </span>
                ) : (
                  'Rotate API Key'
                )}
              </button>
            </div>
            
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {user?.apiKeyEnabled 
                ? 'If your API key is compromised, click "Rotate API Key" to generate a new one.'
                : 'Enable your API key to access the AI Agent API.'}
            </p>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              API Usage
            </h3>
            <div className="prose dark:prose-invert">
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto text-sm">
                <code>{`curl -X POST https://api.example.com/v1/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${user?.apiKeyEnabled ? user?.apiKey || 'YOUR_API_KEY' : 'YOUR_API_KEY'}" \\
  -d '{"messages": ["Hello, AI!"]}'`}</code>
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

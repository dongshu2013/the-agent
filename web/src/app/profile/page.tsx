"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  const { user, loading, signOut, rotateApiKey, toggleApiKey } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
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
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/mizu-logo.png"
              alt="MIZU Agent Logo"
              width={40}
              height={40}
              className="mr-3"
            />
            <h1 className="text-xl font-bold text-gray-900">
              MIZU Agent Dashboard
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
        <div className="bg-white shadow rounded-lg overflow-hidden">
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
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {user?.displayName || "User"}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
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
            <p className="text-sm text-gray-500 mb-4">
              Use this API key to authenticate requests to the MIZU Agent API.
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
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md ${
                    user?.apiKeyEnabled ? "bg-gray-50" : "bg-gray-100"
                  } text-gray-900 focus:ring-blue-500 focus:border-blue-500`}
                  disabled={!user?.apiKeyEnabled}
                />
                {user?.apiKeyEnabled && (
                  <button
                    onClick={handleCopyApiKey}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
        {new Date().getFullYear()} MIZU Agent. All rights reserved.
      </footer>
    </div>
  );
}

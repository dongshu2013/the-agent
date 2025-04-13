'use client';

import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/profile');
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col items-center gap-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">AI Agent Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access your AI agent dashboard
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 w-full">
          <button
            onClick={signInWithGoogle}
            className="flex items-center justify-center gap-3 w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors"
          >
            <Image 
              src="/google-logo.svg" 
              alt="Google logo" 
              width={20} 
              height={20}
              className="w-5 h-5"
            />
            <span>Sign in with Google</span>
          </button>
        </div>
      </main>
    </div>
  );
}

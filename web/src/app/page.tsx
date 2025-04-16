"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/profile");
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center gap-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/mizu-logo.png"
            alt="MIZU Agent Logo"
            width={120}
            height={120}
            className="mb-6"
            priority
          />
          <h1 className="text-4xl font-bold mb-2">MIZU Agent</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your intelligent AI assistant dashboard
          </p>

          <button
            onClick={signInWithGoogle}
            className="flex items-center justify-center gap-3 w-full max-w-xs bg-white hover:bg-gray-50 text-gray-700 rounded-lg py-3 px-6 shadow-md transition-all hover:shadow-lg"
          >
            <Image
              src="/google-logo.svg"
              alt="Google logo"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span className="font-medium">Sign in with Google</span>
          </button>
        </div>
      </main>

      <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
        {new Date().getFullYear()} MIZU Agent. All rights reserved.
      </footer>
    </div>
  );
}

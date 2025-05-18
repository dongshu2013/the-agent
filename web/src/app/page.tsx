'use client';

import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/profile');
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      <div className="w-full max-w-[560px] bg-white rounded-[20px] p-12 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="w-[240px] h-[96px] relative">
            <Image
              src="/mysta-beta-logo.png"
              alt="Mysta Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Your private AI, in your browser.
          </h1>
        </div>

        <div className="space-y-4">
          <button
            onClick={signInWithGoogle}
            className="flex items-center justify-center w-full gap-3 py-3 px-6 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
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

        <div className="mt-6 text-center text-sm text-gray-500 whitespace-nowrap">
          By signing up, you agree to our{' '}
          <Link href="/tos" target="_blank" className="text-blue-500 hover:text-blue-600">
            Terms and Conditions
          </Link>{' '}
          and{' '}
          <Link href="/privacy" target="_blank" className="text-blue-500 hover:text-blue-600">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

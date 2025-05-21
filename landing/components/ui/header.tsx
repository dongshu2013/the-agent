'use client';

import Link from 'next/link';
import Logo from './logo';

export default function Header() {
  const signInUrl = process.env.NEXT_PUBLIC_SIGNIN_URL;

  return (
    <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/90 px-3 shadow-lg shadow-black/[0.03] backdrop-blur-xs before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
          {/* Site branding */}
          <div className="flex flex-1 items-center">
            <Logo />
          </div>

          {/* Desktop sign in links */}
          <ul className="flex flex-1 items-center justify-end gap-3">
            <li>
              <Link
                href={signInUrl || '#'}
                onClick={e => !signInUrl && e.preventDefault()}
                className={`btn-sm text-gray-800 shadow-sm ${
                  signInUrl
                    ? 'bg-white hover:bg-gray-50 cursor-pointer'
                    : 'bg-gray-100 opacity-50 cursor-not-allowed'
                }`}
                title={!signInUrl ? 'Sign in URL not configured' : ''}
              >
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

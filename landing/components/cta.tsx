'use client';

import Image from 'next/image';
import Stripes from '@/public/images/stripes-dark.svg';

export default function Cta() {
  const chromeStoreUrl = process.env.NEXT_PUBLIC_CHROME_STORE_URL;
  const watchVideoUrl = process.env.NEXT_PUBLIC_WATCH_VIDEOS_URL;

  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-2xl text-center shadow-xl before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-900"
          data-aos="zoom-y-out"
        >
          {/* Glow */}
          <div
            className="absolute bottom-0 left-1/2 -z-10 -translate-x-1/2 translate-y-1/2"
            aria-hidden="true"
          >
            <div className="h-56 w-[480px] rounded-full border-[20px] border-blue-500 blur-3xl" />
          </div>
          {/* Stripes illustration */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform"
            aria-hidden="true"
          >
            <Image className="max-w-none" src={Stripes} width={768} height={432} alt="Stripes" />
          </div>
          <div className="px-4 py-12 md:px-12 md:py-20">
            <h2 className="mb-6 border-y text-3xl md:text-5xl font-bold text-gray-200 [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-700/.7),transparent)1] md:mb-12">
              Let AI Run the Web <br className="block md:hidden" />
              for You
            </h2>
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <a
                className={`btn group mb-4 w-full bg-[#0F1115] text-white shadow-sm sm:mb-0 sm:w-auto ${
                  chromeStoreUrl
                    ? 'hover:bg-[#1A1D23] cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                href={chromeStoreUrl || '#'}
                onClick={e => !chromeStoreUrl && e.preventDefault()}
                title={!chromeStoreUrl ? 'Chrome store URL not configured' : ''}
              >
                <span className="relative inline-flex items-center">
                  <Image
                    src="/images/logo-chrome.svg"
                    alt="Chrome logo"
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  Add to Chrome
                </span>
              </a>
              <a
                className={`btn w-full bg-white text-gray-800 shadow-sm sm:ml-4 sm:w-auto ${
                  watchVideoUrl
                    ? 'hover:bg-gray-50 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                href={watchVideoUrl || '#'}
                onClick={e => !watchVideoUrl && e.preventDefault()}
                title={!watchVideoUrl ? 'Watch video URL not configured' : ''}
              >
                <span className="relative inline-flex items-center">
                  <Image
                    src="/images/logo-install.svg"
                    alt="Install logo"
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  How to Install
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

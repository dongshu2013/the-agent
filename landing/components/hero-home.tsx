'use client';

import Image from 'next/image';
import PageIllustration from '@/components/page-illustration';

export default function HeroHome() {
  const chromeStoreUrl = process.env.NEXT_PUBLIC_CHROME_STORE_URL;
  const watchVideoUrl = process.env.NEXT_PUBLIC_WATCH_VIDEOS_URL;

  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Hero content */}
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Section header */}
          <div className="pb-12 text-center md:pb-16">
            <h1
              className="mb-6 border-y text-3xl md:text-5xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1]"
              data-aos="zoom-y-out"
              data-aos-delay={150}
            >
              Let AI Run the Web <br className="block md:hidden" />
              for You
            </h1>
            <div className="mx-auto max-w-3xl">
              <div className="relative before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1]">
                <div
                  className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center"
                  data-aos="zoom-y-out"
                  data-aos-delay={450}
                >
                  <a
                    className={`btn group mb-4 w-full bg-[#0F1115] text-white shadow-sm sm:mb-0 sm:w-auto ${
                      chromeStoreUrl
                        ? 'hover:bg-[#1A1D23] cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    href={chromeStoreUrl || '#'}
                    target="_blank"
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
                  {/* <a
                    className={`btn w-full bg-white text-gray-800 shadow-sm sm:ml-4 sm:w-auto ${
                      watchVideoUrl
                        ? 'hover:bg-gray-50 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    href={watchVideoUrl || '#'}
                    target="_blank"
                    onClick={e => !watchVideoUrl && e.preventDefault()}
                    title={!watchVideoUrl ? 'Watch video URL not configured' : ''}
                  >
                    <span className="relative inline-flex items-center">
                      <Image
                        src="/images/logo-play.svg"
                        alt="Play logo"
                        width={24}
                        height={24}
                        className="mr-2"
                      />
                      Watch video
                    </span>
                  </a> */}
                </div>
              </div>
            </div>
          </div>
          {/* Hero video */}
          <div
            className="mx-auto max-w-7xl px-4 sm:px-6"
            data-aos="zoom-y-out"
            data-aos-delay={600}
          >
            <div className="relative">
              <div className="relative mx-auto max-w-[1200px]">
                <div
                  className="relative overflow-hidden rounded-lg shadow-xl"
                  style={{
                    paddingBottom: '56.25%',
                    height: 0,
                    backgroundColor: '#000',
                  }}
                >
                  <iframe
                    src="https://www.youtube.com/embed/b3Xgf9ZYQFs?autoplay=0&rel=0&modestbranding=1&controls=1&showinfo=0"
                    title="Hero video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0 transition-opacity duration-300"
                    style={{
                      borderRadius: '0.5rem',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

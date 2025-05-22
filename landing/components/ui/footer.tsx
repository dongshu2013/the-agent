import Link from 'next/link';
import Logo from './logo';

export default function Footer({ border = false }: { border?: boolean }) {
  return (
    <footer>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top area: Blocks */}
        <div
          className={`grid gap-10 py-8 sm:grid-cols-12 md:py-12 ${border ? 'border-t [border-image:linear-gradient(to_right,transparent,var(--color-slate-200),transparent)1]' : ''}`}
        >
          {/* 1st block */}
          <div className="space-y-2 sm:col-span-6 lg:col-span-5 order-2 sm:order-1">
            <div>
              <Logo />
            </div>
            {/* Slogan */}
            {/* <p className="font-medium text-gray-700">Your browser, now smarter.</p> */}
            {/* Social block */}
            <ul className="flex gap-1">
              <li>
                <Link
                  className="flex items-center justify-center text-gray-600 transition hover:text-gray-900"
                  href="https://x.com/MystaAI"
                  aria-label="Twitter"
                >
                  <svg
                    className="h-8 w-8 fill-current"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="m13.063 9 3.495 4.475L20.601 9h2.454l-5.359 5.931L24 23h-4.938l-3.866-4.893L10.771 23H8.316l5.735-6.342L8 9h5.063Zm-.74 1.347h-1.457l8.875 11.232h1.36l-8.778-11.232Z"></path>
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center justify-center text-gray-600 transition hover:text-gray-900"
                  href="https://github.com/dongshu2013"
                  aria-label="Github"
                >
                  <svg
                    className="h-8 w-8 fill-current"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M16 8.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V22c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z"></path>
                  </svg>
                </Link>
              </li>
            </ul>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Mysta. All rights reserved.
            </p>
          </div>

          {/* Right side blocks container */}
          <div className="sm:col-span-6 lg:col-span-7 flex flex-col items-center justify-center space-y-2 sm:items-end sm:justify-end sm:space-y-0 sm:space-x-8 sm:flex-row order-1 sm:order-2">
            {/* Legal block */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-center sm:text-right">Legal</h3>
              <ul className="space-y-1 text-center sm:text-right">
                <li>
                  <Link
                    className="text-sm text-gray-600 transition hover:text-gray-900"
                    href="/tos"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-gray-600 transition hover:text-gray-900"
                    href="/privacy"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Big text */}
      <div
        className="
    relative
    min-h-[120px]
    w-full
    sm:min-h-[180px]
    md:min-h-[240px]
    lg:min-h-[300px]
    xl:min-h-[360px]
  "
        aria-hidden="true"
      >
        <div
          className="
    pointer-events-none absolute left-1/2 -z-10 -translate-x-1/2 text-center
    text-[80px] sm:text-[140px] md:text-[200px] lg:text-[260px] xl:text-[348px]
    font-bold leading-none
    before:bg-linear-to-b before:from-gray-200 before:to-gray-100/30 before:to-80%
    before:bg-clip-text before:text-transparent before:content-['MYSTA']
    after:absolute after:inset-0 after:bg-gray-300/70 after:bg-clip-text after:text-transparent
    after:mix-blend-darken after:content-['MYSTA'] after:[text-shadow:0_1px_0_white]
  "
        ></div>
        {/* Glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2/3"
          aria-hidden="true"
        >
          <div className="h-40 w-40 sm:h-56 sm:w-56 rounded-full border-[10px] sm:border-[20px] border-blue-700 blur-[60px] sm:blur-[80px]"></div>
        </div>
      </div>
    </footer>
  );
}

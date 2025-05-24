import Link from 'next/link';
import Logo from './logo';
import { FaLinkedin, FaInstagram, FaYoutube, FaTiktok, FaGithub } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';

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
            <ul className="flex gap-3">
              <li>
                <Link
                  className="flex items-center justify-center text-gray-500 transition hover:text-gray-900"
                  href="https://x.com/MystaAI"
                  aria-label="Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <RiTwitterXFill className="h-5 w-5" />
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center justify-center text-gray-500 transition hover:text-gray-900"
                  href="https://github.com/dongshu2013"
                  aria-label="Github"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub className="h-5 w-5" />
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center justify-center text-gray-500 transition hover:text-gray-900"
                  href="https://www.linkedin.com/company/msyta-ai/about/?viewAsMember=true"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="h-5 w-5" />
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center justify-center text-gray-500 transition hover:text-gray-900"
                  href="https://www.instagram.com/mysta_ai/"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram className="h-5 w-5" />
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center justify-center text-gray-500 transition hover:text-gray-900"
                  href="https://www.youtube.com/@mysta-ai"
                  aria-label="Youtube"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaYoutube className="h-5 w-5" />
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center justify-center text-gray-500 transition hover:text-gray-900"
                  href="https://www.tiktok.com/@mysta_ai"
                  aria-label="Tiktok"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTiktok className="h-5 w-5" />
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

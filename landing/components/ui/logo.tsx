import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" className="inline-flex" aria-label="Mysta">
      <div className="flex items-center gap-2">
        <Image src="/images/mysta-logo-brand-beta.png" alt="Mysta Logo" width={128} height={32} />
      </div>
    </Link>
  );
}

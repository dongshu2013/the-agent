import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" className="inline-flex" aria-label="Mysta">
      <div className="flex items-center gap-2">
        <Image src="/images/mysta-logo.png" alt="Mysta Logo" width={25} height={25} />
        <h1 className="text-xl font-bold tracking-tight black">MYSTA</h1>
        <Image src="/images/beta.png" alt="Beta" width={30} height={12} />
      </div>
    </Link>
  );
}

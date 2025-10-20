'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import { Wallet } from '@coinbase/onchainkit/wallet';

export default function Header() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  const isNewsActive = pathname?.startsWith('/news');
  const isAnalystsActive = pathname?.startsWith('/analysts');
  const isMyProfile = isConnected && address && pathname === `/profile/${address}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4 flex items-center justify-between backdrop-blur-md bg-background/90 border-b border-border/30 shadow-sm">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
        <Image src="/forter.webp" alt="FORTER" width={32} height={32} className="w-8 h-8 rounded-lg" />
        <span className="font-mono text-lg md:text-xl font-bold tracking-wide bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          FORTER
        </span>
      </Link>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link
          href="/news"
          className={`transition-colors duration-200 hover:scale-105 transform ${
            isNewsActive
              ? 'text-foreground font-bold'
              : 'text-muted-foreground hover:text-foreground font-medium'
          }`}
        >
          News
        </Link>
        <Link
          href="/analysts"
          className={`transition-colors duration-200 hover:scale-105 transform ${
            isAnalystsActive
              ? 'text-foreground font-bold'
              : 'text-muted-foreground hover:text-foreground font-medium'
          }`}
        >
          Analysts
        </Link>
        {isConnected && address && (
          <Link
            href={`/profile/${address}`}
            className={`transition-colors duration-200 hover:scale-105 transform ${
              isMyProfile
                ? 'text-foreground font-bold'
                : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            My Profile
          </Link>
        )}
      </nav>
      <div className="flex items-center gap-3">
        <Wallet />
      </div>
    </header>
  );
}
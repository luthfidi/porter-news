"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from 'next/navigation'
import CustomConnectButton from '@/components/wallet/CustomConnectButton'

export default function Header() {
  const pathname = usePathname()

  const isNewsActive = pathname?.startsWith('/news')
  const isAnalystsActive = pathname?.startsWith('/analysts')

  const navigation = [
    { name: "News", href: "/news", active: isNewsActive },
    { name: "Analysts", href: "/analysts", active: isAnalystsActive },
  ]

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <nav className="bg-background/80 backdrop-blur-md border border-border/30 rounded-2xl px-4 py-2 shadow-lg shadow-primary/10">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Image
                src="/forter.webp"
                alt="Porter News"
                width={32}
                height={32}
                className="w-12 h-12 rounded-lg"
              />
              <span className="font-mono text-xl font-bold tracking-wide text-foreground">
                Porter News
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${item.active
                    ? 'text-foreground bg-primary/10'
                    : 'text-foreground/70 hover:text-foreground hover:bg-background/20'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Farcaster User & Connect Wallet */}
            <div className="flex items-center gap-3">
              {/* Farcaster User Info - Only show in MiniApp */}
              {/* {isReady && isInFarcaster && farcasterUser && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  {farcasterUser.pfpUrl && (
                    <Image
                      src={farcasterUser.pfpUrl}
                      alt={farcasterUser.username || 'User'}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    @{farcasterUser.username || `FID:${farcasterUser.fid}`}
                  </span>
                </div>
              )} */}

              <CustomConnectButton />
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
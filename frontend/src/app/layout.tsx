import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Forter - Forecast Porter",
    description:
      "Stake on credibility, not luck. Build on-chain reputation through verifiable analysis and earn from accurate insights.",
    icons: {
      icon: [
        { url: "/forter.ico", type: "image/x-icon" },
        { url: "/forter.png", type: "image/png" },
      ],
      shortcut: "/forter.ico",
      apple: "/forter.png",
    },
    openGraph: {
      title: "Forter - Forecast Porter",
      description:
        "Permissionless information finance protocol. Create predictions, analyze with reasoning, and build on-chain reputation.",
      images: [
        {
          url: "https://forter.app/og-image.png",
          width: 1200,
          height: 630,
          alt: "Forter - Forecast Porter",
        },
      ],
      type: "website",
      siteName: "Forter",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen bg-background">
            <Header />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

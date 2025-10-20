import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="px-4 md:px-6 pt-24 md:pt-32 pb-16 md:pb-20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 backdrop-blur-md px-4 py-2 text-sm font-medium shadow-lg shadow-primary/10">
          <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Forecast Porter
          </span>
        </div>

        <h1 className="text-balance mt-6 text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
          <span className="bg-gradient-to-b from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Stake on Credibility,
          </span>
          <span className="block mt-2 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            not luck.
          </span>
        </h1>

        <p className="text-pretty mt-6 md:mt-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          Porter is the{" "}
          <span className="font-semibold text-foreground">
            Information Finance Protocol
          </span>
          . Back outcomes and the analysts who forecast them. Build portable,
          on-chain reputation with dynamic NFTs.
        </p>

        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/news">
            <Button
              size="lg"
              className="min-w-[160px] h-12 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-105"
            >
              Explore News
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="min-w-[160px] h-12 text-base border-border/50 hover:bg-accent/10 hover:text-foreground transition-all duration-300 hover:scale-105"
          >
            Read the Vision
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Secure, verifiable outcomes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Dual-staking accountability</span>
          </div>
        </div>
      </div>
    </section>
  );
}

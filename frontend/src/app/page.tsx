import DualStaking from "@/components/landing/DualStaking"
import FeaturePillars from "@/components/landing/FeaturePillars"
import Hero from "@/components/landing/Hero"
import HowItWorks from "@/components/landing/HowItWorks"
import ReputationTiers from "@/components/landing/ReputationTiers"
import Header from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function Page() {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="fixed inset-0 z-0" aria-hidden>
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
            linear-gradient(currentColor 1px, transparent 1px),
            linear-gradient(90deg, currentColor 1px, transparent 1px)
          `,
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        <Header />
        <Hero />

        <section id="pillars" className="px-4 md:px-6 py-16">
          <FeaturePillars />
        </section>

        <section id="dual-staking" className="px-4 md:px-6 py-16">
          <DualStaking />
        </section>

        <section id="reputation" className="px-4 md:px-6 py-16">
          <ReputationTiers />
        </section>

        <section id="how" className="px-4 md:px-6 py-16">
          <HowItWorks />
        </section>

        <section className="px-4 md:px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create NEWS Card */}
              <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">📰</div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Create NEWS</h3>
                  <p className="text-muted-foreground mb-6">
                    Create permissionless predictions. Anyone can then analyze and stake on your NEWS.
                  </p>
                  <Link href="/news/create">
                    <Button
                      size="lg"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    >
                      Create NEWS
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Browse & Stake Card */}
              <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Browse & Stake</h3>
                  <p className="text-muted-foreground mb-6">
                    Explore active predictions, create pools with analysis, or stake on credible reasoning.
                  </p>
                  <Link href="/news">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-secondary bg-transparent"
                    >
                      Browse NEWS
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 pb-20 pt-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border border-border bg-card shadow-md">
              <CardContent className="p-8 md:p-12 text-center">
                <h3 className="text-balance text-3xl md:text-4xl font-semibold text-foreground">
                  Transform noise into signal. Finance credible information.
                </h3>
                <p className="mt-4 md:mt-6 text-muted-foreground text-lg text-pretty max-w-2xl mx-auto">
                  Join the permissionless information finance protocol. Build on-chain reputation through verifiable
                  analysis.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/news/create">
                    <Button
                      size="lg"
                      className="min-w-[160px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    >
                      Create NEWS
                    </Button>
                  </Link>
                  <Link href="/news">
                    <Button
                      size="lg"
                      variant="outline"
                      className="min-w-[160px] border-border text-foreground hover:bg-secondary bg-transparent"
                    >
                      Explore News
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}

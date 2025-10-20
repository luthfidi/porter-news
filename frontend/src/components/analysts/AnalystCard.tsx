'use client';

import { ReputationData } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getTierIcon } from '@/lib/mock-data';

interface AnalystCardProps {
  analyst: ReputationData;
}

export default function AnalystCard({ analyst }: AnalystCardProps) {
  // Truncate address for display
  const displayAddress = `${analyst.address.slice(0, 6)}...${analyst.address.slice(-4)}`;

  return (
    <Link href={`/profile/${analyst.address}`} className="block h-full">
      <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer h-full">
        <CardContent className="p-5 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
              {analyst.address.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground truncate">
                {displayAddress}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {getTierIcon(analyst.tier)} {analyst.tier}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  {analyst.accuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid with Win Streak */}
          <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{analyst.totalPools}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Pools</div>
              </div>
              <div className="text-center border-x border-border/50">
                <div className="text-lg font-bold text-emerald-600">
                  {analyst.correctPools || '-'}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Win</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-rose-600">
                  {analyst.wrongPools || '-'}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Loss</div>
              </div>
            </div>

            {/* Win Streak - Integrated */}
            {(analyst.currentStreak ?? 0) > 0 && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="text-xs font-semibold text-orange-500 text-center">
                  🔥 {analyst.currentStreak} Win Streak
                </div>
              </div>
            )}
          </div>

          {/* Specialty */}
          {analyst.specialty && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Specialty</div>
              <div className="flex flex-wrap gap-1.5">
                {analyst.specialty.split(',').map((spec, i) => (
                  <Badge key={i} variant="outline" className="text-xs px-2 py-0.5 bg-background/50">
                    {spec.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Footer */}
          {analyst.memberSince && (
            <div className="pt-3 border-t border-border/50 text-center">
              <span className="text-xs text-muted-foreground">
                Since {analyst.memberSince.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

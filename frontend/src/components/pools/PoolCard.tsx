'use client';

import { Pool } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePoolStaking } from '@/lib/hooks/usePoolStaking';

interface PoolCardProps {
  pool: Pool;
  onStakeSuccess?: () => void;
}

export default function PoolCard({ pool, onStakeSuccess }: PoolCardProps) {
  const { stakeOnPool, calculatePotentialReward, loading } = usePoolStaking();
  const [showFullReasoning, setShowFullReasoning] = useState(false);
  const [showStakeInput, setShowStakeInput] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<'agree' | 'disagree' | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate percentages (including creator stake based on pool position)
  const creatorAgreeStakes = pool.position === 'YES' ? pool.agreeStakes + pool.creatorStake : pool.agreeStakes;
  const creatorDisagreeStakes = pool.position === 'NO' ? pool.disagreeStakes + pool.creatorStake : pool.disagreeStakes;
  
  const agreePercentage = pool.totalStaked > 0
    ? Math.round((creatorAgreeStakes / pool.totalStaked) * 100)
    : 0;
  const disagreePercentage = pool.totalStaked > 0
    ? Math.round((creatorDisagreeStakes / pool.totalStaked) * 100)
    : 0;

  // Mock reputation data
  const getReputationDisplay = (address: string) => {
    const mockReputations: Record<string, { accuracy: number; tier: string }> = {
      '0x1234...5678': { accuracy: 87, tier: 'Master' },
      '0xabcd...efgh': { accuracy: 72, tier: 'Expert' },
      '0x2222...3333': { accuracy: 91, tier: 'Legend' },
      '0x4444...5555': { accuracy: 65, tier: 'Analyst' },
      '0x6666...7777': { accuracy: 78, tier: 'Expert' },
      '0x8888...9999': { accuracy: 70, tier: 'Expert' },
      '0xaaaa...bbbb': { accuracy: 88, tier: 'Master' },
      '0xcccc...dddd': { accuracy: 75, tier: 'Expert' },
      '0x9999...1111': { accuracy: 82, tier: 'Master' }
    };

    return mockReputations[address] || { accuracy: 0, tier: 'Novice' };
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Novice': return '🥉';
      case 'Analyst': return '🥈';
      case 'Expert': return '🥇';
      case 'Master': return '💎';
      case 'Legend': return '👑';
      default: return '❓';
    }
  };

  const reputation = getReputationDisplay(pool.creatorAddress);

  const handleStakeButtonClick = (position: 'agree' | 'disagree') => {
    setSelectedPosition(position);
    setShowStakeInput(true);
    setStakeAmount('');
  };

  const handleConfirmStake = async () => {
    if (stakeAmount && parseFloat(stakeAmount) >= 1 && selectedPosition) {
      setIsSubmitting(true);
      const result = await stakeOnPool(pool.id, selectedPosition, parseFloat(stakeAmount));

      if (result) {
        // Success! Reset state and notify parent
        setShowStakeInput(false);
        setSelectedPosition(null);
        setStakeAmount('');
        onStakeSuccess?.();
      }

      setIsSubmitting(false);
    }
  };

  const handleCancelStake = () => {
    setShowStakeInput(false);
    setSelectedPosition(null);
    setStakeAmount('');
  };

  return (
    <Card className={`border transition-all duration-300 hover:shadow-md ${
      pool.status === 'resolved'
        ? 'border-accent/50 bg-accent/5 hover:bg-accent/10'
        : 'border-border bg-card hover:bg-secondary'
    }`}>
      <CardContent className="p-6">
        {/* Resolved Badge (if resolved) */}
        {pool.status === 'resolved' && pool.outcome && (
          <div className="mb-4 pb-4 border-b border-border/30">
            <div className="flex items-center justify-between">
              <Badge className={`px-3 py-1 ${
                pool.outcome === 'creator_correct'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {pool.outcome === 'creator_correct' ? '✅ CORRECT' : '❌ WRONG'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Resolved Pool
              </span>
            </div>
            {pool.outcome === 'creator_correct' ? (
              <p className="text-xs text-muted-foreground mt-2">
                Pool creator was correct. &quot;Agree&quot; stakers won.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">
                Pool creator was wrong. &quot;Disagree&quot; stakers won.
              </p>
            )}
          </div>
        )}

        {/* Creator Info */}
        <div className="flex items-start justify-between mb-4">
          <Link href={`/profile/${pool.creatorAddress}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
              {pool.creatorAddress.slice(2, 4).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm hover:underline">{pool.creatorAddress}</span>
                <Badge variant="secondary" className="text-xs">
                  {getTierIcon(reputation.tier)} {reputation.tier}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {reputation.accuracy}% accuracy
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Badge
              variant={pool.position === 'YES' ? 'default' : 'secondary'}
              className={pool.position === 'YES'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : 'bg-rose-100 text-rose-700 border-rose-200'
              }
            >
              {pool.position}
            </Badge>
          </div>
        </div>

        {/* Image if exists */}
        {pool.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-border/30">
            <div className="relative w-full h-48">
              <Image
                src={pool.imageUrl}
                alt={pool.imageCaption || 'Pool analysis chart'}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            {pool.imageCaption && (
              <div className="p-2 bg-card/50 text-xs text-muted-foreground text-center">
                📊 {pool.imageCaption}
              </div>
            )}
          </div>
        )}

        {/* Reasoning */}
        <div className="mb-4">
          <p className={`text-sm text-foreground leading-relaxed ${!showFullReasoning && pool.reasoning.length > 150 ? 'line-clamp-3' : ''}`}>
            {pool.reasoning}
          </p>
          {pool.reasoning.length > 150 && (
            <button
              onClick={() => setShowFullReasoning(!showFullReasoning)}
              className="text-xs text-primary hover:underline mt-1"
            >
              {showFullReasoning ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Evidence Links */}
        {pool.evidence.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Supporting Evidence:
            </div>
            <div className="flex flex-wrap gap-2">
              {pool.evidence.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors"
                >
                  Source {index + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Stakes Visualization */}
        <div className="mb-4 p-4 rounded-lg bg-card/50 border border-border/30">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Pool Stakes</span>
            <span className="text-muted-foreground">${pool.totalStaked.toLocaleString()}</span>
          </div>

          {/* Progress bar legend */}
          <div className="flex justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
              <span className="text-emerald-600">Agree</span>
              <span className="font-medium">${creatorAgreeStakes.toLocaleString()} ({agreePercentage}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">${creatorDisagreeStakes.toLocaleString()} ({disagreePercentage}%)</span>
              <span className="text-rose-600">Disagree</span>
              <div className="w-3 h-3 rounded bg-gradient-to-r from-rose-400 to-rose-500"></div>
            </div>
          </div>

          {/* Single combined progress bar */}
          <div className="h-4 bg-muted rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${agreePercentage}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500"
              style={{ width: `${disagreePercentage}%` }}
            />
          </div>

          {/* Creator position indicator */}
          {/* <div className="mt-2 text-xs text-muted-foreground text-center">
            Creator staked ${pool.creatorStake.toLocaleString()} on <span className={pool.position === 'YES' ? 'text-emerald-600' : 'text-rose-600'}>
              {pool.position === 'YES' ? 'Agree' : 'Disagree'}
            </span>
          </div> */}

        </div>

        {/* Action Buttons */}
        {pool.status === 'resolved' ? (
          <div className="p-3 bg-accent/10 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              🔒 Pool Settled - Staking Closed
            </p>
          </div>
        ) : !showStakeInput ? (
          <div className="flex gap-2">
            <Button
              onClick={() => handleStakeButtonClick('agree')}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
              size="sm"
            >
              Stake Agree
            </Button>
            <Button
              onClick={() => handleStakeButtonClick('disagree')}
              variant="outline"
              className="flex-1 hover:border-rose-500/50 bg-rose-500 hover:bg-rose-600 text-white border-rose-500"
              size="sm"
            >
              Stake Disagree
            </Button>
          </div>
        ) : (
          /* Inline Stake Input */
          <div className="space-y-3 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Staking on:{' '}
                <span className={selectedPosition === 'agree' ? 'text-emerald-600' : 'text-rose-600'}>
                  {selectedPosition === 'agree' ? 'Agree' : 'Disagree'}
                </span>
              </span>
              <button
                onClick={handleCancelStake}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕ Cancel
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Amount (USDC)
              </label>
              <Input
                type="number"
                placeholder="Min $1"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                min="1"
                className="bg-background border-border"
              />
            </div>

            {/* Potential Outcomes */}
            {stakeAmount && parseFloat(stakeAmount) >= 1 && selectedPosition && (() => {
              const amount = parseFloat(stakeAmount);
              const potentialReward = calculatePotentialReward(pool, amount, selectedPosition);
              const profit = potentialReward.maxReward - amount;
              const roi = (profit / amount) * 100;

              return (
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="text-xs font-medium text-accent mb-2">Potential Outcomes</div>
                  <div className="space-y-2">
                    {selectedPosition === 'agree' ? (
                      <>
                        <div className="flex justify-between items-center text-xs">
                          <span>If pool CORRECT:</span>
                          <span className="font-bold text-emerald-600">
                            +${potentialReward.maxReward.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          ${profit.toFixed(2)} profit ({roi.toFixed(1)}% ROI)
                        </div>
                        <div className="h-px bg-border my-1"></div>
                        <div className="flex justify-between items-center text-xs">
                          <span>If pool WRONG:</span>
                          <span className="font-bold text-rose-600">
                            -${amount.toFixed(2)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center text-xs">
                          <span>If pool WRONG:</span>
                          <span className="font-bold text-emerald-600">
                            +${potentialReward.maxReward.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          ${profit.toFixed(2)} profit ({roi.toFixed(1)}% ROI)
                        </div>
                        <div className="h-px bg-border my-1"></div>
                        <div className="flex justify-between items-center text-xs">
                          <span>If pool CORRECT:</span>
                          <span className="font-bold text-rose-600">
                            -${amount.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            <Button
              onClick={handleConfirmStake}
              disabled={!stakeAmount || parseFloat(stakeAmount) < 1 || isSubmitting || loading}
              className={`w-full ${
                selectedPosition === 'agree'
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-rose-500 hover:bg-rose-600'
              } text-white`}
              size="sm"
            >
              {isSubmitting || loading ? 'Processing...' : `Confirm Stake $${stakeAmount || '0'}`}
            </Button>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>Created {pool.createdAt.toLocaleDateString()}</span>
          {pool.farcasterCastHash && (
            <a
              href={`https://warpcast.com/~/conversations/${pool.farcasterCastHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              📱 View on Farcaster
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

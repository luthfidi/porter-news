'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { getReputationData, getPoolsByCreator, getStakesByUser, MOCK_NEWS, MOCK_POOLS, getTierIcon } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams();
  const profileAddress = params.address as string;
  const address = profileAddress; // Alias for compatibility with render code
  const { address: connectedAddress, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'pools' | 'stakes' | 'news' | 'activity'>('pools');

  // Check if viewing own profile
  const isOwnProfile = isConnected && connectedAddress?.toLowerCase() === profileAddress.toLowerCase();

  // Load profile data
  const reputation = getReputationData(profileAddress);
  const pools = getPoolsByCreator(profileAddress);
  const stakes = getStakesByUser(profileAddress);
  const newsCreated = MOCK_NEWS.filter(n => n.creatorAddress === profileAddress);

  // Compute stake statistics
  const poolsCreated = pools;
  const stakesHistory = stakes;
  const resolvedStakes = stakes.filter(stake => {
    const pool = MOCK_POOLS.find(p => p.id === stake.poolId);
    return pool?.status === 'resolved';
  });
  const wonStakes = resolvedStakes.filter(stake => {
    const pool = MOCK_POOLS.find(p => p.id === stake.poolId);
    return (
      (stake.position === 'agree' && pool?.outcome === 'creator_correct') ||
      (stake.position === 'disagree' && pool?.outcome === 'creator_wrong')
    );
  });
  const stakingWinRate = resolvedStakes.length > 0
    ? Math.round((wonStakes.length / resolvedStakes.length) * 100)
    : 0;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/news" className="hover:text-foreground transition-colors">
            News
          </Link>
          <span>/</span>
          <span className="text-foreground">Profile</span>
        </div>

        {/* Profile Header */}
        <Card className="border border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                  {address.slice(2, 4).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </h1>
                    {reputation && (
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {getTierIcon(reputation.tier)} {reputation.tier}
                      </Badge>
                    )}
                  </div>

                  {reputation && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-foreground">{reputation.accuracy}%</span> Accuracy
                      </span>
                      {reputation.memberSince && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            Member since {reputation.memberSince.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://basescan.org/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Explorer
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* News Created */}
          <Card className="border border-border/50 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {newsCreated.length}
              </div>
              <div className="text-sm text-muted-foreground">News Created</div>
            </CardContent>
          </Card>

          {/* Pools Created */}
          <Card className="border border-border/50 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {poolsCreated.length}
              </div>
              <div className="text-sm text-muted-foreground">Pools Created</div>
              {reputation && reputation.correctPools > 0 && (
                <div className="text-xs text-green-600 mt-1">
                  {reputation.correctPools}W / {reputation.wrongPools}L
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stakes Made */}
          <Card className="border border-border/50 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-accent mb-1">
                {stakesHistory.length}
              </div>
              <div className="text-sm text-muted-foreground">Stakes Made</div>
              {resolvedStakes.length > 0 && (
                <div className="text-xs text-blue-600 mt-1">
                  {wonStakes.length}W / {resolvedStakes.length - wonStakes.length}L
                </div>
              )}
            </CardContent>
          </Card>

          {/* Win Rate (Staking) */}
          <Card className="border border-border/50 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {stakingWinRate}%
              </div>
              <div className="text-sm text-muted-foreground">Stake Win Rate</div>
              <div className="text-xs text-muted-foreground mt-1">
                (Transparency)
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="border border-border/50 bg-background/80 backdrop-blur-sm mb-6">
          <CardContent className="p-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('pools')}
                className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'pools'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`}
              >
                Pools Created ({poolsCreated.length})
              </button>
              <button
                onClick={() => setActiveTab('stakes')}
                className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'stakes'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`}
              >
                Stakes History ({stakesHistory.length})
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'news'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`}
              >
                News Created ({newsCreated.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'activity'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`}
              >
                Activity
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <div>
          {activeTab === 'pools' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Pools Created</h2>
              {poolsCreated.length > 0 ? (
                <div className="space-y-4">
                  {poolsCreated.map(pool => {
                    const news = MOCK_NEWS.find(n => n.id === pool.newsId);
                    return (
                      <Card key={pool.id} className="border border-border/50 bg-background/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <Link href={`/news/${pool.newsId}`} className="hover:underline">
                                <div className="font-semibold text-sm text-muted-foreground mb-1">
                                  {news?.title || 'Unknown News'}
                                </div>
                              </Link>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  variant={pool.position === 'YES' ? 'default' : 'secondary'}
                                  className={pool.position === 'YES'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                  }
                                >
                                  {pool.position}
                                </Badge>
                                <Badge variant="secondary">
                                  {pool.status === 'resolved'
                                    ? pool.outcome === 'creator_correct' ? '✅ Correct' : '❌ Wrong'
                                    : '⏳ Active'
                                  }
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">${pool.totalStaked.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Total Staked</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {pool.reasoning}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Created {pool.createdAt.toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="border border-border/50 bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <div className="text-4xl mb-4">🏊</div>
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? "You haven't created any analysis pools yet. Start building your reputation!"
                        : "This user hasn't created any analysis pools yet."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'stakes' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Stakes History</h2>
              {stakesHistory.length > 0 ? (
                <div className="space-y-4">
                  {stakesHistory.map(stake => {
                    const pool = MOCK_POOLS.find(p => p.id === stake.poolId);
                    const news = MOCK_NEWS.find(n => n.id === pool?.newsId);
                    const isWon = pool?.status === 'resolved' && (
                      (stake.position === 'agree' && pool.outcome === 'creator_correct') ||
                      (stake.position === 'disagree' && pool.outcome === 'creator_wrong')
                    );
                    const isResolved = pool?.status === 'resolved';

                    return (
                      <Card key={stake.id} className="border border-border/50 bg-background/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <Link href={`/news/${pool?.newsId}`} className="hover:underline">
                                <div className="font-semibold text-sm text-muted-foreground mb-1">
                                  {news?.title || 'Unknown News'}
                                </div>
                              </Link>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary">
                                  {stake.position === 'agree' ? '✅ Agreed' : '❌ Disagreed'}
                                </Badge>
                                {isResolved && (
                                  <Badge variant={isWon ? 'default' : 'secondary'} className={isWon ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                                    {isWon ? '🏆 Won' : '😞 Lost'}
                                  </Badge>
                                )}
                                {!isResolved && (
                                  <Badge variant="secondary">⏳ Pending</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">${stake.amount.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Staked</div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Staked {stake.createdAt.toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="border border-border/50 bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <div className="text-4xl mb-4">💰</div>
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? "You haven't staked on any pools yet. Browse news and support analysts!"
                        : "This user hasn't staked on any pools yet."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'news' && (
            <div>
              <h2 className="text-xl font-bold mb-4">News Created</h2>
              {newsCreated.length > 0 ? (
                <div className="space-y-4">
                  {newsCreated.map(news => (
                    <Card key={news.id} className="border border-border/50 bg-background/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <Link href={`/news/${news.id}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
                                {news.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{news.category}</Badge>
                                <Badge variant={news.status === 'resolved' ? 'default' : 'secondary'}>
                                  {news.status === 'resolved' ? '✅ Resolved' : '⏳ Active'}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">{news.totalPools}</div>
                              <div className="text-xs text-muted-foreground">Pools</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {news.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Created {news.createdAt.toLocaleDateString()} • Resolves {news.endDate.toLocaleDateString()}
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border border-border/50 bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <div className="text-4xl mb-4">📰</div>
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? "You haven't created any news yet. Submit predictions for analysts to analyze!"
                        : "This user hasn't created any news yet."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <Card className="border border-border/50 bg-background/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="text-4xl mb-4">🚧</div>
                  <p className="text-muted-foreground">Activity timeline coming soon</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

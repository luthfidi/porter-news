'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGlobalStore } from '@/store/useGlobalStore';
import { getNewsById, getPoolsByNewsId, getNewsStats } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { isAdmin } from '@/config/admin';
import ResolveNewsModal from '@/components/admin/ResolveNewsModal';
import PoolCard from '@/components/pools/PoolCard';

export default function NewsDetailPage() {
  const params = useParams();
  const newsId = params.id as string;
  const { currentNews, setCurrentNews, pools, setPools, loading, setLoading } = useGlobalStore();
  const { address } = useAccount();
  const [activeFilter, setActiveFilter] = useState<'all' | 'YES' | 'NO'>('all');
  const [showResolveModal, setShowResolveModal] = useState(false);

  const isUserAdmin = isAdmin(address);

  // Load news and pools
  useEffect(() => {
    setLoading('news', true);
    setLoading('pools', true);

    // Simulate API calls
    setTimeout(() => {
      const news = getNewsById(newsId);
      setCurrentNews(news || null);
      setLoading('news', false);
    }, 500);

    setTimeout(() => {
      const newsPools = getPoolsByNewsId(newsId);
      setPools(newsPools);
      setLoading('pools', false);
    }, 800);
  }, [newsId, setCurrentNews, setPools, setLoading]);

  if (loading.news || !currentNews) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Card className="border border-border bg-card animate-pulse">
            <CardContent className="p-12">
              <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredPools = activeFilter === 'all'
    ? pools
    : pools.filter(pool => pool.position === activeFilter);

  const stats = getNewsStats(newsId);

  const refetchPools = () => {
    setLoading('pools', true);
    setTimeout(() => {
      const newsPools = getPoolsByNewsId(newsId);
      setPools(newsPools);
      setLoading('pools', false);
    }, 500);
  };

  const handleResolveNews = (outcome: 'YES' | 'NO', resolutionSource: string, resolutionNotes?: string) => {
    // In real app, this would call API to resolve news
    console.log('Resolving news:', { newsId, outcome, resolutionSource, resolutionNotes, resolvedBy: address });

    // For now, just close modal and show success message
    // In production, this would update news status, resolve all pools, distribute rewards, etc.
    alert(`News resolved as ${outcome}! In production, this would:\n1. Update news status\n2. Resolve all pools\n3. Distribute rewards\n4. Update reputation NFTs`);

    setShowResolveModal(false);

    // Refresh news data
    setTimeout(() => {
      const updatedNews = getNewsById(newsId);
      setCurrentNews(updatedNews || null);
      refetchPools();
    }, 500);
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/news" className="hover:text-foreground transition-colors">
            News
          </Link>
          <span>/</span>
          <span className="text-foreground">NEWS Details</span>
        </div>

        {/* Resolved Banner */}
        {currentNews.status === 'resolved' && currentNews.outcome && (
          <Card className="mb-6 border-2 border-accent bg-accent/5">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`text-lg px-3 py-1 ${
                      currentNews.outcome === 'YES'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {currentNews.outcome === 'YES' ? '✅' : '❌'} RESOLVED: {currentNews.outcome}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Resolved on {currentNews.resolvedAt ? new Date(currentNews.resolvedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">This news has been resolved</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    All pools under this news have been settled. Rewards have been distributed to winning pool creators and stakers.
                  </p>
                  {currentNews.resolutionSource && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Data Source:</span>
                      <a
                        href={currentNews.resolutionSource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {currentNews.resolutionSource}
                      </a>
                    </div>
                  )}
                  {currentNews.resolutionNotes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium">Notes:</span> {currentNews.resolutionNotes}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Actions Section */}
        {isUserAdmin && currentNews.status === 'active' && (
          <Card className="mb-6 border-2 border-orange-500/50 bg-orange-500/5">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-orange-500 text-white">⚠️ ADMIN</Badge>
                    <h3 className="font-semibold">Admin Actions</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    You are an admin. You can resolve this news once the resolution criteria has been met.
                  </p>
                  <Button
                    onClick={() => setShowResolveModal(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    🔒 Resolve News
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2">
            {/* NEWS Header */}
            <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300 mb-8">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {currentNews.category}
                    </Badge>
                    <Badge
                      variant={currentNews.status === 'active' ? 'default' : 'secondary'}
                      className={currentNews.status === 'active'
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-gray-500/10 text-gray-600'
                      }
                    >
                      {currentNews.status.charAt(0).toUpperCase() + currentNews.status.slice(1)}
                    </Badge>
                  </div>
                  <Link href={`/news/${newsId}/pool/create`}>
                    <Button className="bg-gradient-to-r from-primary to-accent">
                      + Create Pool
                    </Button>
                  </Link>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3">
                  {currentNews.title}
                </h1>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  {currentNews.description}
                </p>

                {/* Resolution Criteria */}
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="text-sm font-medium text-accent mb-1">Resolution Criteria:</div>
                  <div className="text-sm text-muted-foreground">
                    {currentNews.resolutionCriteria}
                  </div>
                </div>

                {/* Creator & Date */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">Created by:</span>
                    <span className="font-medium">{currentNews.creatorAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                    <span className="text-muted-foreground">
                      Resolves {new Date(currentNews.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pools Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Pools ({stats.totalPools})</h2>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      activeFilter === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    All ({stats.totalPools})
                  </button>
                  <button
                    onClick={() => setActiveFilter('YES')}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      activeFilter === 'YES'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-card text-muted-foreground hover:bg-emerald-500/10'
                    }`}
                  >
                    YES ({stats.yesPools})
                  </button>
                  <button
                    onClick={() => setActiveFilter('NO')}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      activeFilter === 'NO'
                        ? 'bg-rose-500 text-white'
                        : 'bg-card text-muted-foreground hover:bg-rose-500/10'
                    }`}
                  >
                    NO ({stats.noPools})
                  </button>
                </div>
              </div>

              {/* Pools List */}
              {loading.pools ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="border border-border bg-card animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-muted rounded w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredPools.length > 0 ? (
                <div className="space-y-6">
                  {filteredPools.map((pool) => (
                    <PoolCard key={pool.id} pool={pool} onStakeSuccess={refetchPools} />
                  ))}
                </div>
              ) : (
                <Card className="border border-border bg-card">
                  <CardContent className="p-12 text-center">
                    <div className="text-4xl mb-4">🏊</div>
                    <h3 className="text-xl font-semibold mb-2">No pools yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Be the first to create a pool with your analysis for this NEWS.
                    </p>
                    <Link href={`/news/${newsId}/pool/create`}>
                      <Button className="bg-gradient-to-r from-primary to-accent">
                        Create First Pool
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">NEWS Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Pools</span>
                    <span className="font-semibold">{stats.totalPools}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">YES Pools</span>
                    <span className="font-semibold text-emerald-600">{stats.yesPools}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NO Pools</span>
                    <span className="font-semibold text-rose-600">{stats.noPools}</span>
                  </div>
                  <div className="pt-2 border-t border-border/30">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Staked</span>
                      <span className="font-semibold text-primary">${stats.totalStaked.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolution</span>
                    <span className="font-semibold">
                      {new Date(currentNews.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">💡 How Pools Work</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <span className="text-primary">1.</span>
                    <span>Each pool is an independent analysis with own stake pool</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary">2.</span>
                    <span>Stake &quot;Setuju&quot; to back the pool&apos;s position</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary">3.</span>
                    <span>Stake &quot;Tidak Setuju&quot; to bet against it</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary">4.</span>
                    <span>All pools resolve at same time</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary">5.</span>
                    <span>Rewards distributed per pool independently</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reward Distribution */}
            <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">💰 Reward Split</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Pool Creator (Analyst)</span>
                    <span className="font-semibold text-primary">20%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    If pool position correct
                  </div>
                  <div className="h-px bg-border my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Winning Stakers</span>
                    <span className="font-semibold text-accent">80%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Split proportionally
                  </div>
                  <div className="h-px bg-border my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="font-semibold">2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Pool CTA */}
            <Card className="border border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">Have an Opinion?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your own pool with analysis and stake to earn rewards.
                </p>
                <Link href={`/news/${newsId}/pool/create`}>
                  <Button className="w-full bg-gradient-to-r from-primary to-accent">
                    Create Pool
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Resolve News Modal (Admin Only) */}
      {showResolveModal && currentNews && (
        <ResolveNewsModal
          news={currentNews}
          onClose={() => setShowResolveModal(false)}
          onResolve={handleResolveNews}
        />
      )}
    </div>
  );
}

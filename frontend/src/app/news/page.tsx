'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGlobalStore } from '@/store/useGlobalStore';
import { News } from '@/types';
import { MOCK_NEWS, MOCK_POOLS, MOCK_REPUTATION } from '@/lib/mock-data';
import NewsCard from '@/components/news/NewsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { calculateNewsQualityScore, QualityFilter, ActivityFilter } from '@/lib/quality-scoring';

const CATEGORIES = ['All', 'Crypto', 'Macro', 'Tech', 'Sports', 'Politics'];

export default function NewsPage() {
  const { newsList, setNewsList, loading, setLoading } = useGlobalStore();
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'quality' | 'endDate' | 'totalStaked' | 'totalPools'>('quality');
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('any');

  // Load mock data on component mount
  useEffect(() => {
    setLoading('news', true);
    // Simulate API call
    setTimeout(() => {
      setNewsList(MOCK_NEWS);
      setLoading('news', false);
    }, 1000);
  }, [setNewsList, setLoading]);

  // Calculate quality scores for all news
  const newsWithQuality = useMemo(() => {
    const reputationMap = new Map(
      Object.entries(MOCK_REPUTATION).map(([addr, rep]) => [addr, rep])
    );

    return newsList.map(news => {
      const pools = MOCK_POOLS.filter(p => p.newsId === news.id);
      const qualityScore = calculateNewsQualityScore(news, pools, reputationMap);

      return {
        ...news,
        qualityScore,
      };
    });
  }, [newsList]);

  // Filter and sort news
  useEffect(() => {
    let filtered = newsWithQuality;

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(news => news.status === selectedStatus);
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(news => news.category === selectedCategory);
    }

    // Quality filter
    if (qualityFilter !== 'all') {
      const thresholds = {
        all: 0,
        decent: 40,
        good: 60,
        excellent: 80,
      };
      const minScore = thresholds[qualityFilter];
      filtered = filtered.filter(news => (news.qualityScore ?? 0) >= minScore);
    }

    // Activity filter
    if (activityFilter !== 'any') {
      switch (activityFilter) {
        case 'active':
          filtered = filtered.filter(n => n.totalPools >= 1);
          break;
        case 'popular':
          filtered = filtered.filter(n => n.totalPools >= 3);
          break;
        case 'trending':
          filtered = filtered.filter(n => n.totalPools >= 5 && n.totalStaked >= 100);
          break;
      }
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(news =>
        news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'quality':
          return (b.qualityScore ?? 0) - (a.qualityScore ?? 0);
        case 'endDate':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'totalStaked':
          return b.totalStaked - a.totalStaked;
        case 'totalPools':
          return b.totalPools - a.totalPools;
        default:
          return 0;
      }
    });

    setFilteredNews(filtered);
  }, [newsWithQuality, selectedCategory, selectedStatus, qualityFilter, activityFilter, searchQuery, sortBy]);

  const activeNews = filteredNews.filter(n => n.status === 'active');
  const totalStaked = activeNews.reduce((sum, news) => sum + news.totalStaked, 0);
  const totalPools = activeNews.reduce((sum, news) => sum + news.totalPools, 0);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Image src="/forter.webp" alt="FORTER" width={40} height={40} className="w-10 h-10 rounded-lg" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                News Explorer
              </h1>
            </div>
            <Link href="/news/create">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90">
                + Create NEWS
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Discover active predictions. Create pools with your analysis or stake on existing pools to back credible reasoning.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300 hover:scale-105 hover:shadow-md">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {activeNews.length}
              </div>
              <div className="text-sm text-muted-foreground">Active News</div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300 hover:scale-105 hover:shadow-md">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-accent mb-1">
                {totalPools}
              </div>
              <div className="text-sm text-muted-foreground">Total Pools</div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300 hover:scale-105 hover:shadow-md">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                ${totalStaked.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Staked</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            {/* Search and Sort Row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/80 border-border/50 focus:border-primary transition-colors"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'quality' | 'endDate' | 'totalStaked' | 'totalPools')}
                className="px-4 py-2 rounded-md border border-border/50 bg-background/80 text-sm font-medium hover:border-primary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]"
              >
                <option value="quality">🏆 Quality Score</option>
                <option value="totalStaked">💰 Most Staked</option>
                <option value="totalPools">🏊 Most Pools</option>
                <option value="endDate">⏰ Ending Soon</option>
              </select>
            </div>

            {/* Compact Filter Chips */}
            <div className="space-y-3">
              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[70px]">Status</span>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'active', 'resolved'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedStatus === status
                          ? status === 'active'
                            ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                            : status === 'resolved'
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                            : 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {status === 'all' ? '•' : status === 'active' ? '⚡' : '✓'} {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[70px]">Category</span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[70px]">Quality</span>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'decent', 'good', 'excellent'] as const).map((quality) => (
                    <button
                      key={quality}
                      onClick={() => setQualityFilter(quality)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        qualityFilter === quality
                          ? quality === 'excellent'
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : quality === 'good'
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                            : quality === 'decent'
                            ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/20'
                            : 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {quality === 'all' ? '•' : quality === 'excellent' ? '🏆' : quality === 'good' ? '⭐' : '✓'}{' '}
                      {quality.charAt(0).toUpperCase() + quality.slice(1)}
                      {quality !== 'all' && ` (${quality === 'decent' ? '40+' : quality === 'good' ? '60+' : '80+'})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[70px]">Activity</span>
                <div className="flex flex-wrap gap-2">
                  {(['any', 'active', 'popular', 'trending'] as const).map((activity) => (
                    <button
                      key={activity}
                      onClick={() => setActivityFilter(activity)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        activityFilter === activity
                          ? activity === 'trending'
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                            : activity === 'popular'
                            ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                            : activity === 'active'
                            ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                            : 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {activity === 'any' ? '•' : activity === 'trending' ? '🔥' : activity === 'popular' ? '🌟' : '⚡'}{' '}
                      {activity.charAt(0).toUpperCase() + activity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'all' || qualityFilter !== 'all' || activityFilter !== 'any') && (
              <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="text-muted-foreground font-medium">Showing:</span>
                  {selectedStatus !== 'all' && (
                    <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 font-medium">
                      {selectedStatus}
                    </span>
                  )}
                  {selectedCategory !== 'All' && (
                    <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                      {selectedCategory}
                    </span>
                  )}
                  {qualityFilter !== 'all' && (
                    <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-medium">
                      {qualityFilter} quality
                    </span>
                  )}
                  {activityFilter !== 'any' && (
                    <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 font-medium">
                      {activityFilter}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="px-2 py-1 rounded-md bg-accent/10 text-accent font-medium">
                      &quot;{searchQuery}&quot;
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    ({filteredNews.length} {filteredNews.length === 1 ? 'result' : 'results'})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedStatus('all');
                    setQualityFilter('all');
                    setActivityFilter('any');
                    setSearchQuery('');
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors flex items-center gap-1 group"
                >
                  <svg className="w-3 h-3 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear all
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* News Grid */}
        {loading.news ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border border-border bg-card animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredNews.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        ) : (
          <Card className="border border-border bg-card">
            <CardContent className="p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No news found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or explore different categories.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        {filteredNews.length > 0 && (
          <div className="mt-12 text-center">
            <Card className="border border-border bg-card max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4">Ready to Share Your Prediction?</h3>
                <p className="text-muted-foreground mb-6">
                  Create a NEWS prediction or build a POOL with your analysis to stake on credibility and build on-chain reputation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/news/create">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90">
                      Create NEWS
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

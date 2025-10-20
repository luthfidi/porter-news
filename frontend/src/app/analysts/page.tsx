'use client';

import { useState, useMemo } from 'react';
import { getAllAnalysts, sortAnalysts, getAnalystsByCategory } from '@/lib/mock-data';
import AnalystCard from '@/components/analysts/AnalystCard';
import { Card, CardContent } from '@/components/ui/card';

export default function AnalystsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'accuracy' | 'totalPools' | 'recent'>('accuracy');

  // Get and filter analysts
  const filteredAnalysts = useMemo(() => {
    let analysts = getAllAnalysts();

    // Apply category filter
    if (categoryFilter !== 'All') {
      analysts = getAnalystsByCategory(categoryFilter);
    }

    // Apply sorting
    analysts = sortAnalysts(analysts, sortBy);

    return analysts;
  }, [categoryFilter, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const allAnalysts = getAllAnalysts();
    const totalAnalysts = allAnalysts.length;
    const avgAccuracy = totalAnalysts > 0
      ? Math.round(allAnalysts.reduce((sum, a) => sum + a.accuracy, 0) / totalAnalysts)
      : 0;

    // Count by category
    const categoryCount: Record<string, number> = {};
    allAnalysts.forEach(analyst => {
      if (analyst.specialty) {
        analyst.specialty.split(',').forEach(cat => {
          const trimmed = cat.trim();
          categoryCount[trimmed] = (categoryCount[trimmed] || 0) + 1;
        });
      }
    });

    const mostActiveCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

    return {
      totalAnalysts,
      avgAccuracy,
      mostActiveCategory: mostActiveCategory ? mostActiveCategory[0] : 'N/A',
      mostActiveCategoryCount: mostActiveCategory ? mostActiveCategory[1] : 0
    };
  }, []);

  const categories = ['All', 'Crypto', 'Macro', 'Tech', 'DeFi'];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="mr-2">🏆</span>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Top Analysts & Informers
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Discover credible analysts by track record. All reputation data is verified on-chain and built from proven pool creation performance.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300 hover:scale-105 hover:shadow-md">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {stats.totalAnalysts}
              </div>
              <div className="text-sm text-muted-foreground">Total Analysts</div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300 hover:scale-105 hover:shadow-md">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-accent mb-1">
                {stats.avgAccuracy}%
              </div>
              <div className="text-sm text-muted-foreground">Average Accuracy</div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300 hover:scale-105 hover:shadow-md">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {stats.mostActiveCategory}
              </div>
              <div className="text-sm text-muted-foreground">Most Active Specialty</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
          {/* Category Filter */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Category</div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    categoryFilter === category
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Sort by</div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('accuracy')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === 'accuracy'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                }`}
              >
                Accuracy ▼
              </button>
              <button
                onClick={() => setSortBy('totalPools')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === 'totalPools'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                }`}
              >
                Most Pools
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === 'recent'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                }`}
              >
                Recent
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAnalysts.length} {filteredAnalysts.length === 1 ? 'analyst' : 'analysts'}
            {categoryFilter !== 'All' && ` in ${categoryFilter}`}
          </p>
        </div>

        {/* Analysts Grid */}
        {filteredAnalysts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalysts.map((analyst) => (
              <AnalystCard key={analyst.address} analyst={analyst} />
            ))}
          </div>
        ) : (
          <Card className="border border-border bg-card">
            <CardContent className="p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No analysts found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters to see more results.
              </p>
              <button
                onClick={() => {
                  setCategoryFilter('All');
                  setSortBy('accuracy');
                }}
                className="text-primary hover:underline"
              >
                Reset filters
              </button>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-12 border border-primary/30 bg-primary/5">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-4">💡 How Reputation Works</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">📊 Tier System</h4>
                <ul className="space-y-1">
                  <li>👑 <strong>Legend</strong>: 95%+ accuracy</li>
                  <li>💎 <strong>Master</strong>: 85-94% accuracy</li>
                  <li>🥇 <strong>Expert</strong>: 70-84% accuracy</li>
                  <li>🥈 <strong>Analyst</strong>: 50-69% accuracy</li>
                  <li>🥉 <strong>Novice</strong>: Below 50%</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">🎯 Accuracy Calculation</h4>
                <p className="mb-2">
                  Reputation is calculated <strong>only from pool creation</strong>, not from staking activity.
                </p>
                <p>
                  Accuracy = (Correct Pools / Total Resolved Pools) × 100%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import Link from 'next/link';

const CATEGORIES = ['Crypto', 'Macro', 'Tech', 'Sports', 'Politics'];

export default function CreateNewsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Crypto',
    endDate: '',
    resolutionCriteria: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock: Auto-post to Farcaster
    console.log('Posting to Farcaster:', {
      text: `Just created a new prediction on @forter!\n\n${formData.title}\n\nCreate pools and stake: forter.app/news/new-id`,
      embeds: []
    });

    // Redirect to news page
    router.push('/news');
  };

  const isFormValid = () => {
    return (
      formData.title.trim().length >= 10 &&
      formData.description.trim().length >= 50 &&
      formData.category &&
      formData.endDate &&
      new Date(formData.endDate) > new Date() &&
      formData.resolutionCriteria.trim().length >= 20
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/news" className="hover:text-foreground transition-colors">
            News
          </Link>
          <span>/</span>
          <span className="text-foreground">Create NEWS</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Create NEWS</h1>
          <p className="text-muted-foreground text-lg">
            Create a permissionless prediction or statement. Anyone can then create pools with analysis under your NEWS.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border border-border/50 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {/* Title */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Title * <span className="text-muted-foreground font-normal">(min 10 characters)</span>
                  </label>
                  <Input
                    placeholder="e.g., BTC will hit $100,000 before March 2025"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-background/50 border-border/50"
                    maxLength={120}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {formData.title.length}/120 characters
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Description * <span className="text-muted-foreground font-normal">(min 50 characters)</span>
                  </label>
                  <Textarea
                    placeholder="Provide context and background for this prediction. What factors are relevant? Why is this important?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[120px] bg-background/50 border-border/50"
                    maxLength={500}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {formData.description.length}/500 characters
                  </div>
                </div>

                {/* Category */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Category *</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => setFormData({ ...formData, category })}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          formData.category === category
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/30 hover:border-primary/50'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution Date */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Resolution Date *
                  </label>
                  <DatePicker
                    value={formData.endDate}
                    onChange={(date) => setFormData({ ...formData, endDate: date })}
                    minDate={new Date().toISOString().split('T')[0]}
                    placeholder="Click to select resolution date"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    When will this prediction be resolved?
                  </div>
                </div>

                {/* Resolution Criteria */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Resolution Criteria * <span className="text-muted-foreground font-normal">(min 20 characters)</span>
                  </label>
                  <Textarea
                    placeholder="e.g., BTC price >= $100,000 on CoinGecko at resolution date 23:59 UTC"
                    value={formData.resolutionCriteria}
                    onChange={(e) => setFormData({ ...formData, resolutionCriteria: e.target.value })}
                    className="min-h-[80px] bg-background/50 border-border/50"
                    maxLength={300}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Clear, objective criteria for how this will be resolved. {formData.resolutionCriteria.length}/300
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    disabled={!isFormValid()}
                    className="flex-1"
                  >
                    {showPreview ? 'Hide Preview' : 'Preview'}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isSubmitting}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90"
                  >
                    {isSubmitting ? 'Creating...' : 'Create NEWS & Post to FC'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {showPreview && isFormValid() && (
              <Card className="border border-accent/50 bg-accent/5 backdrop-blur-sm mt-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">{formData.category}</Badge>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                      Active
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{formData.title}</h3>
                  <p className="text-muted-foreground mb-4">{formData.description}</p>

                  <div className="p-3 rounded-lg bg-background/50 border border-border/30 mb-4">
                    <div className="text-xs font-medium mb-1">Resolution Criteria:</div>
                    <div className="text-sm text-muted-foreground">{formData.resolutionCriteria}</div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      <span className="text-muted-foreground">
                        Ends on {new Date(formData.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Guidelines */}
          <div className="space-y-6">
            <Card className="border border-border/50 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">📋 Guidelines</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span>Be specific and clear in your title</span>
                  </div>
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span>Set realistic resolution dates</span>
                  </div>
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span>Use objective, verifiable criteria</span>
                  </div>
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span>Avoid ambiguous language</span>
                  </div>
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span>Include data sources if possible</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">💡 What Happens Next?</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <span className="text-primary">1.</span>
                    <span>Your NEWS is published instantly</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary">2.</span>
                    <span>Auto-posted to Farcaster</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary">3.</span>
                    <span>Others can create POOLS with analysis</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary">4.</span>
                    <span>Stakers back pools they believe in</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary">5.</span>
                    <span>Resolved at specified date</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">⚠️ Important</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    NEWS creators don&apos;t earn rewards directly. Your contribution is creating quality predictions for the community.
                  </p>
                  <p className="mt-3">
                    To earn rewards, create POOLS under NEWS with your analysis and stake.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

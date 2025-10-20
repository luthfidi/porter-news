'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getNewsById } from '@/lib/mock-data';
import { News } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';

export default function CreatePoolPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params.id as string;

  const [news, setNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    position: 'YES' as 'YES' | 'NO',
    reasoning: '',
    evidenceLinks: [''],
    imageUrl: '',
    imageCaption: '',
    creatorStake: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const newsData = getNewsById(newsId);
    setNews(newsData || null);
  }, [newsId]);

  const handleAddEvidenceLink = () => {
    setFormData({
      ...formData,
      evidenceLinks: [...formData.evidenceLinks, '']
    });
  };

  const handleEvidenceLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.evidenceLinks];
    newLinks[index] = value;
    setFormData({ ...formData, evidenceLinks: newLinks });
  };

  const handleRemoveEvidenceLink = (index: number) => {
    if (formData.evidenceLinks.length > 1) {
      setFormData({
        ...formData,
        evidenceLinks: formData.evidenceLinks.filter((_, i) => i !== index)
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock: Auto-post to Farcaster
    console.log('Creating pool and posting to Farcaster:', {
      newsId,
      ...formData,
      text: `Just created a pool on @forter!\n\n${news?.title}\nPosition: ${formData.position}\n\nStake & discuss: forter.app/news/${newsId}`
    });

    // Redirect to news detail page
    router.push(`/news/${newsId}`);
  };

  const isFormValid = () => {
    return (
      formData.reasoning.trim().length >= 100 &&
      formData.creatorStake &&
      parseFloat(formData.creatorStake) >= 20
    );
  };

  if (!news) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <Card className="border border-border bg-card">
            <CardContent className="p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">NEWS not found</h3>
              <p className="text-muted-foreground mb-6">
                The NEWS you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Link href="/news">
                <Button>Browse NEWS</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/news" className="hover:text-foreground transition-colors">
            News
          </Link>
          <span>/</span>
          <Link href={`/news/${newsId}`} className="hover:text-foreground transition-colors">
            NEWS Details
          </Link>
          <span>/</span>
          <span className="text-foreground">Create Pool</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Create Pool</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Submit your analysis with reasoning and stake to prove conviction.
          </p>

          {/* NEWS Context */}
          <Card className="border border-accent/50 bg-accent/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Badge variant="secondary">{news.category}</Badge>
                <div className="flex-1">
                  <div className="font-medium mb-1">{news.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Resolves: {new Date(news.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300">
              <CardContent className="p-6">
                {/* Position Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Your Position *</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, position: 'YES' })}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        formData.position === 'YES'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                          : 'border-border hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="text-lg font-bold">YES</div>
                      <div className="text-sm opacity-75">I believe this will happen</div>
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, position: 'NO' })}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        formData.position === 'NO'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600'
                          : 'border-border hover:border-rose-500/50'
                      }`}
                    >
                      <div className="text-lg font-bold">NO</div>
                      <div className="text-sm opacity-75">I don&apos;t think this will happen</div>
                    </button>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Detailed Analysis & Reasoning * <span className="text-muted-foreground font-normal">(min 100 characters)</span>
                  </label>
                  <Textarea
                    placeholder="Provide detailed reasoning for your position. Include data, trends, and logical arguments to support your analysis..."
                    value={formData.reasoning}
                    onChange={(e) => setFormData({ ...formData, reasoning: e.target.value })}
                    className="min-h-[150px] bg-background border-border"
                    maxLength={1000}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {formData.reasoning.length}/1000 characters • Quality analysis improves your reputation
                  </div>
                </div>

                {/* Image URL (NEW!) */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Chart/Image URL (Optional) 📊
                  </label>
                  <Input
                    placeholder="https://i.imgur.com/your-chart.png"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="bg-background border-border mb-2"
                  />
                  {formData.imageUrl && (
                    <>
                      <Input
                        placeholder="Image caption (optional)"
                        value={formData.imageCaption}
                        onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
                        className="bg-background border-border mb-3"
                        maxLength={100}
                      />
                      {/* Image Preview */}
                      <div className="rounded-lg overflow-hidden border border-border/30">
                        <div className="relative w-full h-48">
                          <Image
                            src={formData.imageUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        {formData.imageCaption && (
                          <div className="p-2 bg-card/50 text-xs text-muted-foreground text-center">
                            📊 {formData.imageCaption}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Paste an image URL from Imgur, Twitter, or any public source. Visual evidence boosts credibility!
                  </div>
                </div>

                {/* Evidence Links */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Supporting Evidence (Optional)
                  </label>
                  {formData.evidenceLinks.map((link, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="https://example.com/supporting-data"
                        value={link}
                        onChange={(e) => handleEvidenceLinkChange(index, e.target.value)}
                        className="bg-background border-border"
                      />
                      {formData.evidenceLinks.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveEvidenceLink(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddEvidenceLink}
                    className="mt-2"
                  >
                    + Add Evidence Link
                  </Button>
                </div>

                {/* Creator Stake */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Your Initial Stake (USDC) *
                  </label>
                  <Input
                    type="number"
                    placeholder="20"
                    value={formData.creatorStake}
                    onChange={(e) => setFormData({ ...formData, creatorStake: e.target.value })}
                    className="bg-background border-border"
                    min="20"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Minimum $20 USDC. You earn 20% of pool rewards if your position is correct.
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
                    {isSubmitting ? 'Creating...' : 'Create Pool & Post to FC'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {showPreview && isFormValid() && (
              <Card className="border border-accent/50 bg-accent/5 mt-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                      YO
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Your Address</div>
                      <div className="text-xs text-muted-foreground">Preview</div>
                    </div>
                    <Badge
                      className={formData.position === 'YES'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 ml-auto'
                        : 'bg-rose-100 text-rose-700 border-rose-200 ml-auto'
                      }
                    >
                      {formData.position}
                    </Badge>
                  </div>

                  {formData.imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-border/30">
                      <div className="relative w-full h-48">
                        <Image
                          src={formData.imageUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      {formData.imageCaption && (
                        <div className="p-2 bg-card/50 text-xs text-muted-foreground text-center">
                          📊 {formData.imageCaption}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-foreground leading-relaxed mb-4">
                    {formData.reasoning}
                  </p>

                  <div className="p-3 rounded-lg bg-card/50 border border-border/30">
                    <div className="text-xs font-medium mb-2">Creator&apos;s Stake</div>
                    <div className="text-sm font-semibold">${parseFloat(formData.creatorStake || '0').toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Guidelines */}
          <div className="space-y-6">
            <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">📋 Pool Guidelines</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span>Write detailed, logical reasoning</span>
                  </div>
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span>Include data and evidence</span>
                  </div>
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span>Upload charts for visual proof</span>
                  </div>
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span>Stake enough to show conviction</span>
                  </div>
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span>Be objective, avoid hype</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">💰 Earning Potential</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <div className="font-medium text-foreground mb-1">If your position is CORRECT:</div>
                    <div className="flex justify-between mb-2">
                      <span>You (analyst) earn:</span>
                      <span className="font-semibold text-primary">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>&quot;Agree&quot; stakers earn:</span>
                      <span className="font-semibold text-accent">80%</span>
                    </div>
                  </div>
                  <div className="h-px bg-border"></div>
                  <div>
                    <div className="font-medium text-foreground mb-1">If your position is WRONG:</div>
                    <div>You lose your stake</div>
                    <div>&quot;Disagree&quot; stakers win</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">🎯 Pro Tips</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    • Higher stakes attract more backers
                  </p>
                  <p>
                    • Quality reasoning builds reputation
                  </p>
                  <p>
                    • Charts increase credibility 3-5x
                  </p>
                  <p>
                    • Link to credible sources
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

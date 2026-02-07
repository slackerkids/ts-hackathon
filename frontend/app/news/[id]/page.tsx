"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Sparkles } from "lucide-react";

interface News {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  tag: string;
  created_at: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setSummarizing(true);
    setSummaryError(null);
    try {
      const res = await api<{ summary: string }>(`/api/news/${params.id}/summary`);
      setSummary(res.summary);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setSummarizing(false);
    }
  };

  useEffect(() => {
    api<News>(`/api/news/${params.id}`)
      .then(setNews)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <p className="text-muted-foreground">{error || "News not found."}</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      {news.image_url && (
        <div className="w-full h-52 rounded-xl overflow-hidden">
          <img src={news.image_url} alt={news.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Badge variant="outline">#{news.tag}</Badge>
        <span className="text-xs text-muted-foreground">
          {new Date(news.created_at).toLocaleDateString()}
        </span>
      </div>

      <h1 className="text-2xl font-bold">{news.title}</h1>

      {/* AI Summary */}
      {summary ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 space-y-1">
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              <Sparkles className="h-3 w-3" /> AI Summary
            </div>
            <p className="text-sm leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" size="sm" onClick={handleSummarize} disabled={summarizing}>
          <Sparkles className="h-4 w-4 mr-1" />
          {summarizing ? "Summarizing..." : "Summarize with AI"}
        </Button>
      )}
      {summaryError && (
        <p className="text-destructive text-sm">{summaryError}</p>
      )}

      <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
        {news.content}
      </div>
    </div>
  );
}

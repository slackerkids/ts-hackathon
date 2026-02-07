"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface News {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  tag: string;
  created_at: string;
  updated_at?: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<News>(`/api/news/${params.id}`)
      .then(setNews)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-hint">Loading...</p>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <button onClick={() => router.back()} className="text-link text-sm">
          &larr; Back
        </button>
        <p className="text-hint">{error || "News not found."}</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <button onClick={() => router.back()} className="text-link text-sm">
        &larr; Back
      </button>

      {news.image_url && (
        <div className="w-full h-52 rounded-xl overflow-hidden">
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs text-link font-medium">#{news.tag}</span>
        <span className="text-xs text-hint">
          {new Date(news.created_at).toLocaleDateString()}
        </span>
      </div>

      <h1 className="text-2xl font-bold">{news.title}</h1>

      <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
        {news.content}
      </div>
    </div>
  );
}

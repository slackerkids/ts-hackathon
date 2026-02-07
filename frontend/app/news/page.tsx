"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface News {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  tag: string;
  created_at: string;
}

const TAGS = ["All", "Official", "Hackathon", "Life", "Education"];

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [activeTag, setActiveTag] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const query = activeTag === "All" ? "" : `?tag=${activeTag}`;
    api<News[]>(`/api/news${query}`)
      .then(setNews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTag]);

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold">News</h1>

      {/* Tag filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTag === tag
                ? "bg-button text-button-text"
                : "bg-secondary-bg text-hint"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* News list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-hint py-8">Loading...</div>
        ) : news.length === 0 ? (
          <div className="text-center text-hint py-8">No news found.</div>
        ) : (
          news.map((item) => (
            <Link key={item.id} href={`/news/${item.id}`}>
              <article className="bg-secondary-bg rounded-xl p-4 space-y-2 hover:opacity-80 transition-opacity">
                {item.image_url && (
                  <div className="w-full h-40 rounded-lg bg-background overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-link font-medium">
                    #{item.tag}
                  </span>
                  <span className="text-xs text-hint">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-hint line-clamp-3">
                  {item.content}
                </p>
              </article>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

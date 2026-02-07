"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface News {
  id: number;
  title: string;
  tag: string;
  created_at: string;
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = () => {
    setLoading(true);
    api<News[]>("/api/news")
      .then(setNews)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchNews, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this news article?")) return;
    try {
      await api(`/api/news/${id}`, { method: "DELETE" });
      setNews(news.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">News CMS</h1>
        <Link
          href="/admin/news/create"
          className="px-3 py-1.5 rounded-lg bg-button text-button-text text-sm font-medium"
        >
          + Create
        </Link>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center text-hint py-8">Loading...</div>
        ) : news.length === 0 ? (
          <div className="text-center text-hint py-8">No news yet.</div>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              className="bg-secondary-bg rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-link font-medium">
                    #{item.tag}
                  </span>
                  <span className="text-xs text-hint">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-medium text-sm truncate">{item.title}</h3>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="ml-2 px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 rounded"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

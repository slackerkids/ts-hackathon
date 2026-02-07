"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TAGS.map((tag) => (
          <Button
            key={tag}
            variant={activeTag === tag ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No news found.</p>
        ) : (
          news.map((item) => (
            <Link key={item.id} href={`/news/${item.id}`}>
              <Card className="hover:opacity-80 transition-opacity">
                <CardContent className="pt-4 space-y-2">
                  {item.image_url && (
                    <div className="w-full h-40 rounded-lg overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{item.tag}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.content}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

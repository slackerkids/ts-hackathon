"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2 } from "lucide-react";

interface News {
  id: number;
  title: string;
  tag: string;
  created_at: string;
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<News[]>("/api/news")
      .then(setNews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
        <Button asChild size="sm">
          <Link href="/admin/news/create">
            <Plus className="h-4 w-4 mr-1" /> Create
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No news yet.</p>
        ) : (
          news.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{item.tag}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm truncate">{item.title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

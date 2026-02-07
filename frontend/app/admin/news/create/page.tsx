"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

const TAGS = ["Official", "Hackathon", "Life", "Education"];

export default function CreateNewsPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("Official");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api("/api/news", {
        method: "POST",
        body: JSON.stringify({ title, content, tag, image_url: imageUrl || undefined }),
      });
      router.push("/admin/news");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create news");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create News</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="News title..." />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Tag</label>
              <div className="flex gap-2 flex-wrap">
                {TAGS.map((t) => (
                  <Badge
                    key={t}
                    variant={tag === t ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setTag(t)}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Image URL (optional)</label>
              <Input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Content</label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="Write your news article..." />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Publishing..." : "Publish News"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

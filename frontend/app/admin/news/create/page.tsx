"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

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
        body: JSON.stringify({
          title,
          content,
          tag,
          image_url: imageUrl || undefined,
        }),
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
      <button onClick={() => router.back()} className="text-link text-sm">
        &larr; Back
      </button>
      <h1 className="text-xl font-bold">Create News</h1>

      {error && (
        <div className="bg-red-500/10 text-red-500 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-hint">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-secondary-bg text-foreground text-sm outline-none border border-hint/20 focus:border-link"
            placeholder="News title..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-hint">Tag</label>
          <div className="flex gap-2">
            {TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tag === t
                    ? "bg-button text-button-text"
                    : "bg-secondary-bg text-hint"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-hint">Image URL (optional)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-secondary-bg text-foreground text-sm outline-none border border-hint/20 focus:border-link"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-hint">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 rounded-lg bg-secondary-bg text-foreground text-sm outline-none border border-hint/20 focus:border-link resize-none"
            placeholder="Write your news article..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-button text-button-text font-medium text-sm disabled:opacity-50"
        >
          {submitting ? "Publishing..." : "Publish News"}
        </button>
      </form>
    </div>
  );
}

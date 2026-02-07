"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export default function CreateClubPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [schedule, setSchedule] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Club name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api("/api/clubs", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: description || undefined,
          image_url: imageUrl || undefined,
          schedule: schedule || undefined,
        }),
      });
      router.push("/admin/clubs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create club");
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
          <CardTitle>Create Club</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Club Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Coding Club" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="What is this club about?" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Image URL (optional)</label>
              <Input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Schedule (optional)</label>
              <Input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="e.g. Mon & Wed, 18:00" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Creating..." : "Create Club"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

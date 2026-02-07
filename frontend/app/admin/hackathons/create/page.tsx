"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export default function CreateHackathonPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !startDate || !endDate) {
      setError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api("/api/hackathons", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
        }),
      });
      router.push("/admin/hackathons");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create hackathon");
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
          <CardTitle>Create Hackathon</CardTitle>
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
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Hackathon title..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the hackathon..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Creating..." : "Create Hackathon"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

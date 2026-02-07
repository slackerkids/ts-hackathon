"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

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
      setError(
        err instanceof Error ? err.message : "Failed to create hackathon"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <button onClick={() => router.back()} className="text-link text-sm">
        &larr; Back
      </button>
      <h1 className="text-xl font-bold">Create Hackathon</h1>

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
            placeholder="Hackathon title..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-hint">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 rounded-lg bg-secondary-bg text-foreground text-sm outline-none border border-hint/20 focus:border-link resize-none"
            placeholder="Describe the hackathon..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-hint">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary-bg text-foreground text-sm outline-none border border-hint/20 focus:border-link"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-hint">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary-bg text-foreground text-sm outline-none border border-hint/20 focus:border-link"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-button text-button-text font-medium text-sm disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Hackathon"}
        </button>
      </form>
    </div>
  );
}

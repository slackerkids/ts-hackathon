"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/auth";
import { api } from "@/lib/api";

interface Hackathon {
  id: number;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
}

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    api<Hackathon>(`/api/hackathons/${params.id}`)
      .then(setHackathon)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleApply = async () => {
    if (!user) return;
    setApplying(true);
    try {
      await api(`/api/hackathons/${params.id}/apply`, {
        method: "POST",
        body: JSON.stringify({ team_name: teamName }),
      });
      setApplied(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to apply";
      if (message.includes("already applied")) {
        setApplied(true);
      } else {
        setError(message);
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-hint">Loading...</p>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <button onClick={() => router.back()} className="text-link text-sm">
          &larr; Back
        </button>
        <p className="text-hint">{error || "Hackathon not found."}</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <button onClick={() => router.back()} className="text-link text-sm">
        &larr; Back
      </button>

      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-medium uppercase px-2 py-0.5 rounded-full ${
            hackathon.status === "active"
              ? "bg-green-500/20 text-green-600"
              : "bg-hint/20 text-hint"
          }`}
        >
          {hackathon.status}
        </span>
      </div>

      <h1 className="text-2xl font-bold">{hackathon.title}</h1>

      <div className="flex gap-4 text-sm text-hint">
        <div>
          <p className="text-xs">Start</p>
          <p className="font-medium text-foreground">
            {new Date(hackathon.start_date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs">End</p>
          <p className="font-medium text-foreground">
            {new Date(hackathon.end_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
        {hackathon.description}
      </div>

      {/* Apply section */}
      {hackathon.status === "active" && user && !applied && (
        <div className="bg-secondary-bg rounded-xl p-4 space-y-3">
          <h3 className="font-semibold">Apply to this hackathon</h3>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name (optional)"
            className="w-full px-3 py-2 rounded-lg bg-background text-foreground text-sm outline-none border border-hint/20 focus:border-link"
          />
          <button
            onClick={handleApply}
            disabled={applying}
            className="w-full py-2.5 rounded-lg bg-button text-button-text font-medium text-sm disabled:opacity-50"
          >
            {applying ? "Applying..." : "Submit Application"}
          </button>
        </div>
      )}

      {applied && (
        <div className="bg-green-500/10 text-green-600 rounded-xl p-4 text-sm font-medium text-center">
          Application submitted successfully!
        </div>
      )}
    </div>
  );
}

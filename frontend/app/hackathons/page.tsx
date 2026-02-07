"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Hackathon {
  id: number;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [tab, setTab] = useState<"active" | "past">("active");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<Hackathon[]>(`/api/hackathons?status=${tab}`)
      .then(setHackathons)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold">Hackathons</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "active"
              ? "bg-button text-button-text"
              : "bg-secondary-bg text-hint"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setTab("past")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "past"
              ? "bg-button text-button-text"
              : "bg-secondary-bg text-hint"
          }`}
        >
          Past
        </button>
      </div>

      {/* Hackathon cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-hint py-8">Loading...</div>
        ) : hackathons.length === 0 ? (
          <div className="text-center text-hint py-8">
            No {tab} hackathons.
          </div>
        ) : (
          hackathons.map((h) => (
            <Link key={h.id} href={`/hackathons/${h.id}`}>
              <article className="bg-secondary-bg rounded-xl p-4 space-y-2 hover:opacity-80 transition-opacity">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium uppercase px-2 py-0.5 rounded-full ${
                      h.status === "active"
                        ? "bg-green-500/20 text-green-600"
                        : "bg-hint/20 text-hint"
                    }`}
                  >
                    {h.status}
                  </span>
                </div>
                <h2 className="font-semibold">{h.title}</h2>
                <p className="text-sm text-hint line-clamp-2">
                  {h.description}
                </p>
                <p className="text-xs text-hint">
                  {new Date(h.start_date).toLocaleDateString()} -{" "}
                  {new Date(h.end_date).toLocaleDateString()}
                </p>
              </article>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Hackathon {
  id: number;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
}

export default function AdminHackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Hackathon[]>("/api/hackathons")
      .then(setHackathons)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this hackathon?")) return;
    try {
      await api(`/api/hackathons/${id}`, { method: "DELETE" });
      setHackathons(hackathons.filter((h) => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Hackathons</h1>
        <Link
          href="/admin/hackathons/create"
          className="px-3 py-1.5 rounded-lg bg-button text-button-text text-sm font-medium"
        >
          + Create
        </Link>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center text-hint py-8">Loading...</div>
        ) : hackathons.length === 0 ? (
          <div className="text-center text-hint py-8">No hackathons yet.</div>
        ) : (
          hackathons.map((h) => (
            <div
              key={h.id}
              className="bg-secondary-bg rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium uppercase px-2 py-0.5 rounded-full ${
                      h.status === "active"
                        ? "bg-green-500/20 text-green-600"
                        : "bg-hint/20 text-hint"
                    }`}
                  >
                    {h.status}
                  </span>
                  <h3 className="font-medium text-sm">{h.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-hint">
                <span>
                  {new Date(h.start_date).toLocaleDateString()} -{" "}
                  {new Date(h.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/hackathons/${h.id}/applications`}
                  className="text-xs text-link hover:underline"
                >
                  View Applications
                </Link>
                <button
                  onClick={() => handleDelete(h.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

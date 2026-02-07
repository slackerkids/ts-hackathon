"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

interface Application {
  id: number;
  hackathon_id: number;
  user_id: number;
  team_name?: string;
  status: string;
  user?: User;
  created_at: string;
}

export default function HackathonApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Application[]>(`/api/hackathons/${params.id}/applications`)
      .then(setApplications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="px-4 pt-6 space-y-4">
      <button onClick={() => router.back()} className="text-link text-sm">
        &larr; Back
      </button>
      <h1 className="text-xl font-bold">Applications</h1>
      <p className="text-sm text-hint">
        Hackathon #{params.id} - {applications.length} application(s)
      </p>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center text-hint py-8">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="text-center text-hint py-8">
            No applications yet.
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="bg-secondary-bg rounded-xl p-4 space-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">
                    {app.user?.first_name} {app.user?.last_name}
                  </p>
                  {app.user?.username && (
                    <p className="text-xs text-hint">@{app.user.username}</p>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    app.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-600"
                      : app.status === "approved"
                      ? "bg-green-500/20 text-green-600"
                      : "bg-hint/20 text-hint"
                  }`}
                >
                  {app.status}
                </span>
              </div>
              {app.team_name && (
                <p className="text-xs text-hint">Team: {app.team_name}</p>
              )}
              <p className="text-xs text-hint">
                Applied: {new Date(app.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

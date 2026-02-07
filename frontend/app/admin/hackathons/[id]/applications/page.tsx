"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users } from "lucide-react";

interface Application {
  id: number;
  hackathon_id: number;
  user_id: number;
  team_name?: string;
  status: string;
  user?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
  created_at: string;
}

export default function HackathonApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Application[]>(`/api/hackathons/${params.id}/applications`)
      .then(setApps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="px-4 pt-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h1 className="text-xl font-bold">Applications</h1>
        <Badge variant="secondary">{apps.length}</Badge>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No applications yet.</p>
        ) : (
          apps.map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">
                      {app.user?.first_name || "User"} {app.user?.last_name || ""}
                      {app.user?.username && (
                        <span className="text-muted-foreground"> @{app.user.username}</span>
                      )}
                    </p>
                    {app.team_name && (
                      <p className="text-xs text-muted-foreground">Team: {app.team_name}</p>
                    )}
                  </div>
                  <Badge variant="outline">{app.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

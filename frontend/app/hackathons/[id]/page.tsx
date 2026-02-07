"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Send } from "lucide-react";

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
  const [teamName, setTeamName] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    api<Hackathon>(`/api/hackathons/${params.id}`)
      .then(setHackathon)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleApply = async () => {
    setApplying(true);
    setApplyError(null);
    try {
      await api(`/api/hackathons/${params.id}/apply`, {
        method: "POST",
        body: JSON.stringify({ team_name: teamName || undefined }),
      });
      setApplied(true);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <p className="text-muted-foreground">Hackathon not found.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <h1 className="text-2xl font-bold">{hackathon.title}</h1>

      <div className="flex items-center gap-2">
        <Badge variant={hackathon.status === "active" ? "default" : "secondary"} className="uppercase">
          {hackathon.status}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {hackathon.description}
          </div>
        </CardContent>
      </Card>

      {/* Apply section */}
      {user && hackathon.status === "active" && !applied && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <h3 className="font-semibold">Apply to this hackathon</h3>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team name (optional)"
            />
            {applyError && (
              <p className="text-destructive text-sm">{applyError}</p>
            )}
            <Button onClick={handleApply} disabled={applying} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {applying ? "Applying..." : "Submit Application"}
            </Button>
          </CardContent>
        </Card>
      )}

      {applied && (
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-green-600 font-medium">Application submitted successfully!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

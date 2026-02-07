"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, Calendar, LogIn, LogOut } from "lucide-react";

interface Club {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  schedule?: string;
  member_count?: number;
  is_member?: boolean;
}

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchClub = () => {
    api<Club>(`/api/clubs/${params.id}`)
      .then(setClub)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchClub, [params.id]);

  const handleJoin = async () => {
    setToggling(true);
    // Optimistic update
    const prev = club;
    setClub((c) => c ? { ...c, is_member: true, member_count: (c.member_count ?? 0) + 1 } : c);
    try {
      const updated = await api<Club>(`/api/clubs/${params.id}/join`, { method: "POST" });
      setClub(updated);
    } catch (err) {
      // Revert on error
      setClub(prev);
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  const handleLeave = async () => {
    setToggling(true);
    // Optimistic update
    const prev = club;
    setClub((c) => c ? { ...c, is_member: false, member_count: Math.max((c.member_count ?? 1) - 1, 0) } : c);
    try {
      await api(`/api/clubs/${params.id}/leave`, { method: "DELETE" });
    } catch (err) {
      // Revert on error
      setClub(prev);
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <p className="text-muted-foreground">Club not found.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      {club.image_url && (
        <div className="w-full h-48 rounded-xl overflow-hidden">
          <img src={club.image_url} alt={club.name} className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-2xl font-bold">{club.name}</h1>
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          <Users className="h-3 w-3 mr-1" />
          {club.member_count ?? 0} members
        </Badge>
        {club.is_member && <Badge>Joined</Badge>}
      </div>

      {club.description && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{club.description}</p>
          </CardContent>
        </Card>
      )}

      {club.schedule && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{club.schedule}</p>
          </CardContent>
        </Card>
      )}

      {user && (
        <div className="pt-2">
          {club.is_member ? (
            <Button variant="outline" onClick={handleLeave} disabled={toggling} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              {toggling ? "Leaving..." : "Leave Club"}
            </Button>
          ) : (
            <Button onClick={handleJoin} disabled={toggling} className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              {toggling ? "Joining..." : "Join Club"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

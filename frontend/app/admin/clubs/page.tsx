"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Users } from "lucide-react";

interface Club {
  id: number;
  name: string;
  member_count?: number;
}

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Club[]>("/api/clubs")
      .then(setClubs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this club?")) return;
    // Optimistic: remove from list immediately
    const prev = clubs;
    setClubs(clubs.filter((c) => c.id !== id));
    try {
      await api(`/api/clubs/${id}`, { method: "DELETE" });
    } catch (err) {
      // Revert on error
      setClubs(prev);
      console.error(err);
    }
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Clubs Manager</h1>
        <Button asChild size="sm">
          <Link href="/admin/clubs/create">
            <Plus className="h-4 w-4 mr-1" /> Create
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        {loading ? (
          [1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))
        ) : clubs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No clubs yet.</p>
        ) : (
          clubs.map((club) => (
            <Card key={club.id}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium text-sm">{club.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {club.member_count ?? 0} members
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(club.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

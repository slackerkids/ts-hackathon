"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

interface Club {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  schedule?: string;
  member_count?: number;
  is_member?: boolean;
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Club[]>("/api/clubs")
      .then(setClubs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold">Clubs</h1>
      <p className="text-sm text-muted-foreground">Find your community.</p>

      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))
        ) : clubs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No clubs yet.</p>
        ) : (
          clubs.map((club) => (
            <Link key={club.id} href={`/clubs/${club.id}`}>
              <Card className="hover:opacity-80 transition-opacity">
                <CardContent className="pt-4 flex items-start gap-4">
                  {club.image_url ? (
                    <img
                      src={club.image_url}
                      alt={club.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h2 className="font-semibold truncate">{club.name}</h2>
                    {club.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {club.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {club.member_count ?? 0} members
                      </Badge>
                      {club.is_member && (
                        <Badge variant="default" className="text-xs">Joined</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

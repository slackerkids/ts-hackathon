"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2 } from "lucide-react";

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
        <Button asChild size="sm">
          <Link href="/admin/hackathons/create">
            <Plus className="h-4 w-4 mr-1" /> Create
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : hackathons.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hackathons yet.</p>
        ) : (
          hackathons.map((h) => (
            <Card key={h.id}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={h.status === "active" ? "default" : "secondary"} className="uppercase text-xs">
                      {h.status}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm truncate">{h.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.start_date).toLocaleDateString()} - {new Date(h.end_date).toLocaleDateString()}
                  </p>
                  <Link href={`/admin/hackathons/${h.id}/applications`} className="text-xs text-primary font-medium">
                    View Applications
                  </Link>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(h.id)} className="text-destructive hover:text-destructive">
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

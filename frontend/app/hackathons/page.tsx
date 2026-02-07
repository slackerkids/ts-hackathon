"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

      <div className="flex gap-2">
        <Button
          variant={tab === "active" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setTab("active")}
        >
          Active
        </Button>
        <Button
          variant={tab === "past" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setTab("past")}
        >
          Past
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : hackathons.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No {tab} hackathons.
          </p>
        ) : (
          hackathons.map((h) => (
            <Link key={h.id} href={`/hackathons/${h.id}`}>
              <Card className="hover:opacity-80 transition-opacity">
                <CardContent className="pt-4 space-y-2">
                  <Badge
                    variant={h.status === "active" ? "default" : "secondary"}
                    className="uppercase text-xs"
                  >
                    {h.status}
                  </Badge>
                  <h2 className="font-semibold">{h.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {h.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.start_date).toLocaleDateString()} -{" "}
                    {new Date(h.end_date).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

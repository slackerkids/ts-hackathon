"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Landmark, ExternalLink } from "lucide-react";

interface GovMember {
  id: number;
  name: string;
  role_title: string;
  photo_url?: string;
  contact_url?: string;
  display_order?: number;
}

export default function GovPage() {
  const [members, setMembers] = useState<GovMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<GovMember[]>("/api/gov")
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center gap-2">
        <Landmark className="h-6 w-6" />
        <h1 className="text-xl font-bold">Student Government</h1>
      </div>
      <p className="text-sm text-muted-foreground">Meet your student representatives.</p>

      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))
        ) : members.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No government members listed yet.</p>
        ) : (
          members.map((member) => (
            <Card key={member.id}>
              <CardContent className="pt-4 flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={member.photo_url} alt={member.name} />
                  <AvatarFallback className="text-lg">
                    {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold truncate">{member.name}</h2>
                  <Badge variant="secondary" className="mt-0.5">{member.role_title}</Badge>
                </div>
                {member.contact_url && (
                  <a
                    href={member.contact_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:opacity-70 transition-opacity"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

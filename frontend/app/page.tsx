"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, Trophy, User, Settings, Coins, GraduationCap, Users, Landmark } from "lucide-react";

interface News {
  id: number;
  title: string;
  content: string;
  tag: string;
  created_at: string;
}

interface Hackathon {
  id: number;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
}

export default function Home() {
  const { user, loading: authLoading } = useUser();
  const [news, setNews] = useState<News[]>([]);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<News[]>("/api/news").then((data) => setNews(data.slice(0, 3))),
      api<Hackathon[]>("/api/hackathons?status=active").then((data) => {
        if (data.length > 0) setHackathon(data[0]);
      }),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const greeting = user
    ? `Welcome, ${user.first_name || user.username || "Student"}!`
    : "TS Community OS";

  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Hero Section */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <h1 className="text-xl font-bold">{greeting}</h1>
          <p className="text-sm text-muted-foreground">
            Your digital hub for Tomorrow School life
          </p>
          {user && (
            <div className="flex gap-3 pt-2">
              <div className="bg-muted rounded-xl px-4 py-3 flex-1 text-center">
                <p className="text-lg font-bold text-primary capitalize">
                  {user.role.replace("_", " ")}
                </p>
                <p className="text-xs text-muted-foreground">Role</p>
              </div>
              {user.role !== "guest" && (
                <>
                  <div className="bg-muted rounded-xl px-4 py-3 flex-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <p className="text-lg font-bold">{user.coins ?? 0}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Coins</p>
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-3 flex-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <GraduationCap className="h-4 w-4 text-blue-500" />
                      <p className="text-lg font-bold">{user.school_level ?? 0}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Level</p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nearest Event */}
      {hackathon && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Nearest Event</h2>
          <Link href={`/hackathons/${hackathon.id}`}>
            <Card className="hover:opacity-80 transition-opacity">
              <CardContent className="pt-4 space-y-1">
                <Badge variant="secondary" className="uppercase text-xs">
                  {hackathon.status}
                </Badge>
                <h3 className="font-semibold text-sm">{hackathon.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(hackathon.start_date).toLocaleDateString()} -{" "}
                  {new Date(hackathon.end_date).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        </section>
      )}

      {/* News Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest News</h2>
          <Link href="/news" className="text-primary text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : news.length === 0 ? (
            <p className="text-muted-foreground text-sm">No news yet.</p>
          ) : (
            news.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`}>
                <Card className="hover:opacity-80 transition-opacity">
                  <CardContent className="pt-4 space-y-1">
                    <Badge variant="outline" className="text-xs">
                      #{item.tag}
                    </Badge>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link href="/news">
            <Card className="hover:opacity-80 transition-opacity">
              <CardContent className="pt-4 flex flex-col items-center gap-2">
                <Newspaper className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">News</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/hackathons">
            <Card className="hover:opacity-80 transition-opacity">
              <CardContent className="pt-4 flex flex-col items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">Hackathons</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/clubs">
            <Card className="hover:opacity-80 transition-opacity">
              <CardContent className="pt-4 flex flex-col items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">Clubs</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/gov">
            <Card className="hover:opacity-80 transition-opacity">
              <CardContent className="pt-4 flex flex-col items-center gap-2">
                <Landmark className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">Gov</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/profile">
            <Card className="hover:opacity-80 transition-opacity">
              <CardContent className="pt-4 flex flex-col items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">Profile</span>
              </CardContent>
            </Card>
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin">
              <Card className="hover:opacity-80 transition-opacity">
                <CardContent className="pt-4 flex flex-col items-center gap-2">
                  <Settings className="h-6 w-6 text-primary" />
                  <span className="text-xs font-medium">Admin</span>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

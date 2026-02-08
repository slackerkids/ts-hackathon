"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Newspaper, Trophy, User, Settings, Coins, GraduationCap, Users, Landmark, ShoppingBag, Crown } from "lucide-react";

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

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  coins: number;
  school_level?: number;
}

export default function Home() {
  const { user, loading: authLoading } = useUser();
  const [news, setNews] = useState<News[]>([]);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<News[]>("/api/news").then((data) => setNews(data.slice(0, 3))),
      api<Hackathon[]>("/api/hackathons?status=active").then((data) => {
        if (data.length > 0) setHackathon(data[0]);
      }),
      api<LeaderboardEntry[]>("/api/leaderboard").then(setLeaderboard).catch(() => {}),
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

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Leaderboard</h2>
          </div>
          <Card>
            <CardContent className="pt-4 space-y-2">
              {leaderboard.slice(0, 5).map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 py-2 ${
                    user && entry.user_id === user.id ? "bg-primary/10 -mx-2 px-2 rounded-lg" : ""
                  }`}
                >
                  <span className="text-sm font-bold w-6 text-center text-muted-foreground">
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.photo_url} />
                    <AvatarFallback className="text-xs">
                      {entry.first_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {entry.first_name} {entry.last_name || ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm font-semibold">{entry.coins}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
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
          <Link href="/shop">
            <Card className="hover:opacity-80 transition-opacity">
              <CardContent className="pt-4 flex flex-col items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">Shop</span>
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
          <Link href="/admin">
            <Card className="hover:opacity-80 transition-opacity">
              <CardContent className="pt-4 flex flex-col items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">Admin</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { api } from "@/lib/api";

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

  useEffect(() => {
    api<News[]>("/api/news")
      .then((data) => setNews(data.slice(0, 3)))
      .catch(console.error);

    api<Hackathon[]>("/api/hackathons?status=active")
      .then((data) => {
        if (data.length > 0) setHackathon(data[0]);
      })
      .catch(console.error);
  }, []);

  const greeting = user
    ? `Welcome, ${user.first_name || user.username || "Student"}!`
    : "TS Community OS";

  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Hero Section */}
      <section className="bg-secondary-bg rounded-2xl p-5 space-y-2">
        <h1 className="text-xl font-bold">{greeting}</h1>
        <p className="text-hint text-sm">
          Your digital hub for Tomorrow School life
        </p>
        {user && (
          <div className="flex gap-3 pt-2">
            <div className="bg-background rounded-xl px-4 py-3 flex-1 text-center">
              <p className="text-2xl font-bold text-link capitalize">
                {user.role.replace("_", " ")}
              </p>
              <p className="text-xs text-hint">Role</p>
            </div>
          </div>
        )}
      </section>

      {/* Nearest Event */}
      {hackathon && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Nearest Event</h2>
          <Link href={`/hackathons/${hackathon.id}`}>
            <div className="bg-secondary-bg rounded-xl p-4 space-y-1 hover:opacity-80 transition-opacity">
              <span className="text-xs text-link font-medium uppercase">
                {hackathon.status}
              </span>
              <h3 className="font-semibold text-sm">{hackathon.title}</h3>
              <p className="text-xs text-hint">
                {new Date(hackathon.start_date).toLocaleDateString()} -{" "}
                {new Date(hackathon.end_date).toLocaleDateString()}
              </p>
            </div>
          </Link>
        </section>
      )}

      {/* News Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest News</h2>
          <Link href="/news" className="text-link text-sm">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {news.length === 0 && !authLoading && (
            <p className="text-hint text-sm">No news yet.</p>
          )}
          {news.map((item) => (
            <Link key={item.id} href={`/news/${item.id}`}>
              <div className="bg-secondary-bg rounded-xl p-4 space-y-1 hover:opacity-80 transition-opacity">
                <span className="text-xs text-link font-medium">
                  #{item.tag}
                </span>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-hint line-clamp-2">
                  {item.content}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/news">
            <ActionCard title="News" icon="📰" />
          </Link>
          <Link href="/hackathons">
            <ActionCard title="Hackathons" icon="🏆" />
          </Link>
          <Link href="/profile">
            <ActionCard title="Profile" icon="👤" />
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin">
              <ActionCard title="Admin" icon="⚙️" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function ActionCard({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="bg-secondary-bg rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}

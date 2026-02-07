"use client";

import { useState, type PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, Lock, User as UserIcon } from "lucide-react";

export default function AdminLayout({ children }: PropsWithChildren) {
  const { user, loading, refreshUser } = useUser();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setError(null);
    try {
      await api("/api/auth/admin", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  // Not logged in via Telegram at all
  if (!user) {
    return (
      <div className="px-4 pt-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">Not Authenticated</h2>
            <p className="text-sm text-muted-foreground">
              Open this app inside Telegram to continue.
            </p>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in via Telegram but not admin — show login form
  if (user.role !== "admin") {
    return (
      <div className="px-4 pt-6">
        <Card>
          <CardHeader className="text-center">
            <Lock className="h-10 w-10 mx-auto text-primary mb-2" />
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Enter admin credentials to access the CMS.
            </p>
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
              <Button type="submit" disabled={loggingIn} className="w-full">
                {loggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

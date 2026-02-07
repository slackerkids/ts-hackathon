"use client";

import { useState } from "react";
import { useUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QRCodeSVG } from "qrcode.react";
import { User as UserIcon, GraduationCap, Coins, Shield, QrCode, School } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useUser();
  const [showVerify, setShowVerify] = useState(false);
  const [schoolUser, setSchoolUser] = useState("");
  const [schoolPass, setSchoolPass] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyError(null);
    try {
      await api("/api/auth/school", {
        method: "POST",
        body: JSON.stringify({ username: schoolUser, password: schoolPass }),
      });
      await refreshUser();
      setShowVerify(false);
      setSchoolUser("");
      setSchoolPass("");
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 pt-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <UserIcon className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">Not Authenticated</h2>
            <p className="text-sm text-muted-foreground">
              Open this app inside Telegram to see your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold">Profile</h1>

      {/* User Info Card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.photo_url} alt="Avatar" />
              <AvatarFallback className="text-xl">
                {user.first_name?.[0] || user.username?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">
                {user.first_name} {user.last_name}
              </h2>
              {user.username && (
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              )}
              <Badge variant="secondary" className="mt-1 capitalize">
                <Shield className="h-3 w-3 mr-1" />
                {user.role.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <ProfileRow label="Telegram ID" value={String(user.telegram_id)} />
            {user.school_login && (
              <ProfileRow label="School Login" value={user.school_login} />
            )}
            {user.created_at && (
              <ProfileRow label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* School Stats (only for verified students) */}
      {user.role !== "guest" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-5 w-5" /> School Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold">{user.school_level ?? 0}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{user.school_xp ?? 0}</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{(user.audit_ratio ?? 0).toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Audit Ratio</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coins */}
      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">Coins</span>
          </div>
          <span className="text-2xl font-bold">{user.coins ?? 0}</span>
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="h-5 w-5" /> Your QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG value={String(user.id)} size={180} />
          </div>
        </CardContent>
        <CardContent className="pt-0">
          <p className="text-xs text-center text-muted-foreground">
            Show this to an admin to check-in at events and earn coins.
          </p>
        </CardContent>
      </Card>

      {/* School Verification (for guests only) */}
      {user.role === "guest" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <School className="h-5 w-5" /> Verify Student Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showVerify ? (
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Verify your student account to unlock full access.
                </p>
                <Button onClick={() => setShowVerify(true)} className="w-full">
                  <School className="h-4 w-4 mr-2" /> Verify with School Account
                </Button>
              </div>
            ) : (
              <form onSubmit={handleVerify} className="space-y-3">
                {verifyError && (
                  <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                    {verifyError}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">School Username</label>
                  <Input
                    value={schoolUser}
                    onChange={(e) => setSchoolUser(e.target.value)}
                    placeholder="your.login"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">School Password</label>
                  <Input
                    type="password"
                    value={schoolPass}
                    onChange={(e) => setSchoolPass(e.target.value)}
                    placeholder="Password"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowVerify(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={verifying} className="flex-1">
                    {verifying ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

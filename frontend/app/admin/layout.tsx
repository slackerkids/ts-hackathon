"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth";
import { type PropsWithChildren } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: PropsWithChildren) {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="px-4 pt-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              This area is restricted to administrators.
            </p>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

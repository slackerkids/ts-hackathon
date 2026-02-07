"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth";
import { type PropsWithChildren } from "react";

export default function AdminLayout({ children }: PropsWithChildren) {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-hint">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="px-4 pt-6">
        <div className="bg-secondary-bg rounded-2xl p-6 text-center space-y-3">
          <p className="text-4xl">🔒</p>
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-sm text-hint">
            This area is restricted to administrators.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg bg-button text-button-text text-sm font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

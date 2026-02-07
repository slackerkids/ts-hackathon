"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <p className="text-sm text-hint">Manage content and hackathons.</p>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/news">
          <div className="bg-secondary-bg rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">📰</span>
            <span className="text-sm font-medium">News CMS</span>
          </div>
        </Link>
        <Link href="/admin/hackathons">
          <div className="bg-secondary-bg rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🏆</span>
            <span className="text-sm font-medium">Hackathons</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

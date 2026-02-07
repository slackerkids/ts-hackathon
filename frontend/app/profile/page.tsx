"use client";

import { useUser } from "@/lib/auth";

export default function ProfilePage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-hint">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 pt-6">
        <div className="bg-secondary-bg rounded-2xl p-6 text-center space-y-2">
          <p className="text-4xl">👤</p>
          <h2 className="text-lg font-semibold">Not Authenticated</h2>
          <p className="text-sm text-hint">
            Open this app inside Telegram to see your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold">Profile</h1>

      <div className="bg-secondary-bg rounded-2xl p-6 space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          {user.photo_url ? (
            <img
              src={user.photo_url}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-button/20 flex items-center justify-center text-2xl">
              {user.first_name?.[0] || user.username?.[0] || "?"}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold">
              {user.first_name} {user.last_name}
            </h2>
            {user.username && (
              <p className="text-sm text-hint">@{user.username}</p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 pt-2">
          <ProfileRow label="Role" value={user.role.replace("_", " ")} />
          <ProfileRow label="Telegram ID" value={String(user.telegram_id)} />
          {user.created_at && (
            <ProfileRow
              label="Joined"
              value={new Date(user.created_at).toLocaleDateString()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-hint/10 last:border-0">
      <span className="text-sm text-hint">{label}</span>
      <span className="text-sm font-medium capitalize">{value}</span>
    </div>
  );
}

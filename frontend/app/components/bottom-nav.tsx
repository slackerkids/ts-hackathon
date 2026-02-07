"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, Trophy, Users, Landmark, User } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/hackathons", label: "Events", icon: Trophy },
  { href: "/clubs", label: "Clubs", icon: Users },
  { href: "/gov", label: "Gov", icon: Landmark },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

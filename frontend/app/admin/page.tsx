"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, Trophy, QrCode, Users, Landmark, ShoppingBag } from "lucide-react";

const adminActions = [
  { href: "/admin/news", label: "News CMS", icon: Newspaper },
  { href: "/admin/hackathons", label: "Hackathons", icon: Trophy },
  { href: "/admin/scanner", label: "QR Scanner", icon: QrCode },
  { href: "/admin/clubs", label: "Clubs", icon: Users },
  { href: "/admin/gov", label: "Government", icon: Landmark },
  { href: "/admin/shop", label: "Shop", icon: ShoppingBag },
];

export default function AdminPage() {
  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <p className="text-sm text-muted-foreground">Manage content and community.</p>

      <div className="grid grid-cols-2 gap-3">
        {adminActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Card className="hover:opacity-80 transition-opacity">
                <CardContent className="pt-6 flex flex-col items-center gap-2">
                  <Icon className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

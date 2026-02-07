"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, ShoppingBag, Coins } from "lucide-react";

interface ShopItem {
  id: number;
  name: string;
  price_coins: number;
  stock?: number;
}

export default function AdminShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ShopItem[]>("/api/shop")
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this shop item?")) return;
    const prev = items;
    setItems(items.filter((i) => i.id !== id));
    try {
      await api(`/api/shop/${id}`, { method: "DELETE" });
    } catch (err) {
      setItems(prev);
      console.error(err);
    }
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" /> Shop Manager
        </h1>
        <Button asChild size="sm">
          <Link href="/admin/shop/create">
            <Plus className="h-4 w-4 mr-1" /> Create
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        {loading ? (
          [1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No shop items yet.</p>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium text-sm">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Coins className="h-3 w-3 mr-1 text-yellow-500" />{item.price_coins} coins
                    </Badge>
                    {item.stock !== undefined && item.stock >= 0 && (
                      <span className="text-xs text-muted-foreground">{item.stock} in stock</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

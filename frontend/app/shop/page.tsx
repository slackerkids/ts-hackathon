"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Coins, Package } from "lucide-react";

interface ShopItem {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  price_coins: number;
  stock?: number;
}

export default function ShopPage() {
  const { user, refreshUser } = useUser();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<ShopItem[]>("/api/shop")
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (itemId: number) => {
    setBuying(itemId);
    setError(null);
    setSuccessId(null);

    // Optimistic: decrement stock locally
    const prev = items;
    setItems((items) =>
      items.map((i) =>
        i.id === itemId && i.stock && i.stock > 0 ? { ...i, stock: i.stock - 1 } : i
      )
    );

    try {
      await api(`/api/shop/${itemId}/buy`, { method: "POST" });
      setSuccessId(itemId);
      await refreshUser();
      setTimeout(() => setSuccessId(null), 2000);
    } catch (err) {
      // Revert on error
      setItems(prev);
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" /> Shop
        </h1>
        {user && (
          <Badge variant="secondary" className="text-sm">
            <Coins className="h-3 w-3 mr-1 text-yellow-500" />{user.coins ?? 0} coins
          </Badge>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))
        ) : items.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No items in the shop yet.</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.image_url && (
                <div className="w-full h-24 overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className={`${item.image_url ? "pt-3" : "pt-4"} space-y-2`}>
                <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    <Coins className="h-3 w-3 mr-1 text-yellow-500" />{item.price_coins}
                  </Badge>
                  {item.stock !== undefined && item.stock >= 0 && (
                    <span className="text-xs text-muted-foreground">{item.stock} left</span>
                  )}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={
                    buying === item.id ||
                    successId === item.id ||
                    (item.stock !== undefined && item.stock === 0) ||
                    !user ||
                    (user.coins ?? 0) < item.price_coins
                  }
                  onClick={() => handleBuy(item.id)}
                >
                  {successId === item.id
                    ? "Purchased!"
                    : buying === item.id
                    ? "Buying..."
                    : item.stock === 0
                    ? "Sold Out"
                    : "Buy"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export default function CreateShopItemPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priceCoins, setPriceCoins] = useState("");
  const [stock, setStock] = useState("-1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !priceCoins) {
      setError("Name and price are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api("/api/shop", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: description || undefined,
          image_url: imageUrl || undefined,
          price_coins: parseInt(priceCoins),
          stock: parseInt(stock),
        }),
      });
      router.push("/admin/shop");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create Shop Item</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Item description" rows={3} />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Image URL</label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Price (coins) *</label>
                <Input type="number" value={priceCoins} onChange={(e) => setPriceCoins(e.target.value)} placeholder="10" required min="0" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Stock (-1 = unlimited)</label>
                <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="-1" />
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Creating..." : "Create Item"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

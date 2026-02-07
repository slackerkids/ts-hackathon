"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Plus, Landmark } from "lucide-react";

interface GovMember {
  id: number;
  name: string;
  role_title: string;
  photo_url?: string;
  contact_url?: string;
  display_order?: number;
}

export default function AdminGovPage() {
  const [members, setMembers] = useState<GovMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [contactUrl, setContactUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<GovMember[]>("/api/gov")
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this government member?")) return;
    // Optimistic: remove from list immediately
    const prev = members;
    setMembers(members.filter((m) => m.id !== id));
    try {
      await api(`/api/gov/${id}`, { method: "DELETE" });
    } catch (err) {
      // Revert on error
      setMembers(prev);
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roleTitle.trim()) {
      setError("Name and role title are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await api<GovMember>("/api/gov", {
        method: "POST",
        body: JSON.stringify({
          name,
          role_title: roleTitle,
          photo_url: photoUrl || undefined,
          contact_url: contactUrl || undefined,
          display_order: parseInt(displayOrder) || 0,
        }),
      });
      setMembers([...members, created]);
      setName("");
      setRoleTitle("");
      setPhotoUrl("");
      setContactUrl("");
      setDisplayOrder("0");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create member");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Landmark className="h-5 w-5" /> Government
        </h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Government Member</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-3">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
              <Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Role Title (e.g. Minister of Education)" />
              <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Photo URL (optional)" />
              <Input value={contactUrl} onChange={(e) => setContactUrl(e.target.value)} placeholder="Contact URL (optional)" />
              <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} placeholder="Display Order" />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {loading ? (
          [1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))
        ) : members.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No government members yet.</p>
        ) : (
          members.map((member) => (
            <Card key={member.id}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.photo_url} alt={member.name} />
                    <AvatarFallback>
                      {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <Badge variant="outline" className="text-xs">{member.role_title}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(member.id)}
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

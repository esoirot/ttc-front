import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientHeaderProps } from "@/types/clients.types";

export function ClientHeader({ client, onUpdate, saving }: ClientHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: client.name,
    legalName: client.legalName ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    address: client.address ?? "",
    city: client.city ?? "",
    country: client.country ?? "",
    postalCode: client.postalCode ?? "",
    vatNumber: client.vatNumber ?? "",
  });

  function resetForm() {
    setForm({
      name: client.name,
      legalName: client.legalName ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      city: client.city ?? "",
      country: client.country ?? "",
      postalCode: client.postalCode ?? "",
      vatNumber: client.vatNumber ?? "",
    });
  }

  async function handleSave(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    await onUpdate({
      id: client.id,
      name: form.name || undefined,
      legalName: form.legalName || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      country: form.country || undefined,
      postalCode: form.postalCode || undefined,
      vatNumber: form.vatNumber || undefined,
    });
    setEditing(false);
  }

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="mb-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="cl-name">Name</Label>
            <Input
              id="cl-name"
              value={form.name}
              onChange={set("name")}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="cl-legalName">Legal name</Label>
            <Input
              id="cl-legalName"
              value={form.legalName}
              onChange={set("legalName")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="cl-email">Email</Label>
            <Input
              id="cl-email"
              type="email"
              value={form.email}
              onChange={set("email")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="cl-phone">Phone</Label>
            <Input id="cl-phone" value={form.phone} onChange={set("phone")} />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <Label htmlFor="cl-address">Address</Label>
            <Input
              id="cl-address"
              value={form.address}
              onChange={set("address")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="cl-city">City</Label>
            <Input id="cl-city" value={form.city} onChange={set("city")} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="cl-postalCode">Postal code</Label>
            <Input
              id="cl-postalCode"
              value={form.postalCode}
              onChange={set("postalCode")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="cl-country">Country</Label>
            <Input
              id="cl-country"
              value={form.country}
              onChange={set("country")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="cl-vatNumber">VAT number</Label>
            <Input
              id="cl-vatNumber"
              value={form.vatNumber}
              onChange={set("vatNumber")}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              resetForm();
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          {client.legalName && client.legalName !== client.name && (
            <p className="text-muted-foreground text-sm">{client.legalName}</p>
          )}
          {client.hubspotId && (
            <Badge variant="secondary" className="mt-1">
              HubSpot linked
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-6 text-sm">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Company
          </p>
          {client.address && <span>{client.address}</span>}
          {(client.city ?? client.country) && (
            <span>
              {[client.postalCode, client.city, client.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
          {client.vatNumber && (
            <span className="text-muted-foreground">
              VAT {client.vatNumber}
            </span>
          )}
          {client.email && (
            <span className="text-muted-foreground">{client.email}</span>
          )}
          {client.phone && (
            <span className="text-muted-foreground">{client.phone}</span>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateClient } from "../../hooks/clients/useClients";

const EMPTY_FORM = {
  name: "",
  legalName: "",
  address: "",
  city: "",
  country: "",
  postalCode: "",
  vatNumber: "",
  email: "",
  phone: "",
};

type Props = { onClose: () => void };

export function NewClientForm({ onClose }: Props) {
  const { createClient, loading } = useCreateClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  function setField(key: keyof typeof EMPTY_FORM, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Company name is required");
      return;
    }
    setError(null);
    await createClient({
      name: form.name.trim(),
      legalName: form.legalName || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      country: form.country || undefined,
      postalCode: form.postalCode || undefined,
      vatNumber: form.vatNumber || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
    });
    setForm(EMPTY_FORM);
    onClose();
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">New client</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Company name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Acme Ltd."
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="legalName">Legal name</Label>
              <Input
                id="legalName"
                value={form.legalName}
                onChange={(e) => setField("legalName", e.target.value)}
                placeholder="Acme Limited"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="123 Main St"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                placeholder="Paris"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setField("country", e.target.value)}
                placeholder="France"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input
                id="postalCode"
                value={form.postalCode}
                onChange={(e) => setField("postalCode", e.target.value)}
                placeholder="75001"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="vatNumber">VAT number</Label>
              <Input
                id="vatNumber"
                value={form.vatNumber}
                onChange={(e) => setField("vatNumber", e.target.value)}
                placeholder="FR00123456789"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Company email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="billing@acme.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="phone">Company phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+33 1 00 00 00 00"
              />
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
          <p className="text-xs text-muted-foreground">
            Add contacts from the client detail page after creation.
          </p>
          <Button type="submit" disabled={loading} className="self-end">
            {loading ? "Creating…" : "Create client"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

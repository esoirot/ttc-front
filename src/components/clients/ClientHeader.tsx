import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TtcTagChips } from "@/components/time/TtcTagChips";
import { AddressFields } from "./AddressFields";
import { BillingFields } from "./BillingFields";
import { useClientHeaderForm } from "@/hooks/clients/useClientHeaderForm";
import { hasBilling } from "@/hooks/clients/clientUtils";
import { INDUSTRY_LABELS } from "@/types/clients.types";
import type {
  ClientHeaderProps,
  ClientType,
  ClientIndustry,
} from "@/types/clients.types";

export function ClientHeader({ client, onUpdate, saving }: ClientHeaderProps) {
  const {
    editing,
    setEditing,
    tags,
    form,
    setForm,
    resetForm,
    set,
    handleAddressChange,
    handleBillingChange,
    handleSave,
    isCompany,
  } = useClientHeaderForm(client, onUpdate);

  if (editing) {
    return (
      <form onSubmit={handleSave} className="mb-6 flex flex-col gap-4">
        <Tabs
          value={form.clientType}
          onValueChange={(v) =>
            setForm((prev) => ({ ...prev, clientType: v as ClientType }))
          }
        >
          <TabsList>
            <TabsTrigger value="COMPANY">Company</TabsTrigger>
            <TabsTrigger value="INDIVIDUAL">Individual</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {isCompany ? "Company" : "Individual"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {isCompany ? (
                <>
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
                    <Label htmlFor="cl-vatNumber">VAT number</Label>
                    <Input
                      id="cl-vatNumber"
                      value={form.vatNumber}
                      onChange={set("vatNumber")}
                    />
                  </div>
                  <div />
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="cl-firstName">First name</Label>
                    <Input
                      id="cl-firstName"
                      value={form.firstName}
                      onChange={set("firstName")}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="cl-lastName">Last name</Label>
                    <Input
                      id="cl-lastName"
                      value={form.lastName}
                      onChange={set("lastName")}
                    />
                  </div>
                </>
              )}
              <div className="col-span-2 flex flex-col gap-1">
                <Label htmlFor="cl-website">Website</Label>
                <Input
                  id="cl-website"
                  value={form.website}
                  onChange={set("website")}
                  placeholder="https://acme.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="cl-industry">Industry</Label>
                <Select
                  value={form.industry ?? ""}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      industry: (v as ClientIndustry) || null,
                    }))
                  }
                >
                  <SelectTrigger id="cl-industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(INDUSTRY_LABELS) as [
                        ClientIndustry,
                        string,
                      ][]
                    ).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Contact
            </p>
            <div className="grid grid-cols-2 gap-3">
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
                <Input
                  id="cl-phone"
                  value={form.phone}
                  onChange={set("phone")}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Address
            </p>
            <div className="grid grid-cols-2 gap-3">
              <AddressFields
                address={form.address}
                city={form.city}
                country={form.country}
                postalCode={form.postalCode}
                onChange={handleAddressChange}
                idPrefix="cl"
              />
            </div>
          </div>

          <BillingFields
            paymentDelayDays={form.paymentDelayDays}
            taxRate={form.taxRate}
            billingEndOfMonth={form.billingEndOfMonth}
            onChange={handleBillingChange}
            idPrefix="cl"
          />

          <div className="pt-4 border-t border-border flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tags
            </p>
            <TtcTagChips
              tagIds={form.tagIds}
              tags={tags}
              onAdd={(id) =>
                setForm((prev) => ({ ...prev, tagIds: [...prev.tagIds, id] }))
              }
              onRemove={(id) =>
                setForm((prev) => ({
                  ...prev,
                  tagIds: prev.tagIds.filter((x) => x !== id),
                }))
              }
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
          {client.clientType === "COMPANY" &&
            client.legalName &&
            client.legalName !== client.name && (
              <p className="text-muted-foreground text-sm">
                {client.legalName}
              </p>
            )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge
              variant={
                client.clientType === "COMPANY" ? "secondary" : "outline"
              }
            >
              {client.clientType === "COMPANY" ? "Company" : "Individual"}
            </Badge>
            {client.hubspotId && (
              <Badge variant="secondary">HubSpot linked</Badge>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-6 text-sm">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {client.clientType === "COMPANY" ? "Company" : "Contact"}
          </p>
          {client.address && <span>{client.address}</span>}
          {(client.city ?? client.country) && (
            <span>
              {[client.postalCode, client.city, client.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
          {client.clientType === "COMPANY" && client.vatNumber && (
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
          {client.website && (
            <a
              href={client.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:underline break-all"
            >
              {client.website}
            </a>
          )}
          {client.industry && (
            <Badge variant="outline" className="w-fit text-xs">
              {INDUSTRY_LABELS[client.industry]}
            </Badge>
          )}
        </div>

        {hasBilling(client) && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Billing
            </p>
            {client.paymentDelayDays !== null && (
              <span>Payment: {client.paymentDelayDays} days</span>
            )}
            {client.taxRate !== null && <span>Tax: {client.taxRate}%</span>}
            {client.billingEndOfMonth && (
              <span className="text-muted-foreground">End of month</span>
            )}
          </div>
        )}
      </div>

      {client.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {client.tags.map((t) => (
            <Badge key={t.id} variant="secondary" className="text-xs">
              {t.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

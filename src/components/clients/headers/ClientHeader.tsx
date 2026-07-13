import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientHeaderForm } from "@/hooks/clients/useClientHeaderForm";
import { hasBilling } from "@/hooks/clients/clientUtils";
import { INDUSTRY_LABELS, STATUS_LABELS } from "@/constants/clients";
import type {
  ClientHeaderProps,
  ClientType,
  ClientIndustry,
  ClientStatus,
} from "@/types/clients.types";
import { BillingFields } from "../form-fields/BillingFields";
import { AddressFields } from "../form-fields/AddressFields";
import { ColorField } from "../form-fields/ColorField";
import { TtcTagChips } from "@/components/time/tags/TtcTagChips";
import { toSafeHref } from "@/lib/schemas";

export function ClientHeader({ client, onUpdate, saving }: ClientHeaderProps) {
  const {
    editing,
    setEditing,
    tags,
    form,
    setForm,
    resetForm,
    set,
    touch,
    errors,
    handleAddressChange,
    handleBillingChange,
    handleSave,
    isCompany,
  } = useClientHeaderForm(client, onUpdate);
  const websiteHref = toSafeHref(client.website);

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
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="cl-legalForm">Legal form</Label>
                    <Input
                      id="cl-legalForm"
                      value={form.legalForm}
                      onChange={set("legalForm")}
                      placeholder="SAS, Ltd, LLC…"
                    />
                  </div>
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
                  onBlur={touch("website")}
                  placeholder="https://acme.com"
                />
                {errors.website && (
                  <span className="text-xs text-destructive">
                    {errors.website}
                  </span>
                )}
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
              <ColorField
                id="cl-color"
                value={form.color}
                onChange={(v) => setForm((prev) => ({ ...prev, color: v }))}
              />
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
                  onBlur={touch("email")}
                />
                {errors.email && (
                  <span className="text-xs text-destructive">
                    {errors.email}
                  </span>
                )}
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
                addressLine2={form.addressLine2}
                city={form.city}
                country={form.country}
                state={form.state}
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

          <div className="pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Notes
            </p>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cl-notes">Notes</Label>
              <Textarea
                id="cl-notes"
                value={form.notes}
                onChange={set("notes")}
                placeholder="Internal notes about this client…"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Status
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="cl-status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      status: v as ClientStatus,
                    }))
                  }
                >
                  <SelectTrigger id="cl-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(STATUS_LABELS) as [ClientStatus, string][]
                    ).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="cl-contactedAt">Contacted At</Label>
                <Input
                  id="cl-contactedAt"
                  type="date"
                  value={form.contactedAt}
                  onChange={set("contactedAt")}
                />
              </div>
            </div>
          </div>

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
          <div className="flex items-center gap-2">
            {client.color && (
              <span
                className="h-4 w-4 shrink-0 rounded-sm border border-border"
                style={{ backgroundColor: client.color }}
              />
            )}
            <h1 className="text-2xl font-bold">{client.name}</h1>
          </div>
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
            <Badge variant="outline">{STATUS_LABELS[client.status]}</Badge>
            {client.hubspotId && (
              <Badge variant="secondary">HubSpot linked</Badge>
            )}
          </div>
          {client.contactedAt && (
            <p className="text-muted-foreground text-xs mt-1">
              Last contacted:{" "}
              {new Date(client.contactedAt).toLocaleDateString()}
            </p>
          )}
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
          {client.addressLine2 && <span>{client.addressLine2}</span>}
          {(client.city ?? client.state ?? client.country) && (
            <span>
              {[client.postalCode, client.city, client.state, client.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
          {client.clientType === "COMPANY" && client.vatNumber && (
            <span className="text-muted-foreground">
              VAT {client.vatNumber}
            </span>
          )}
          {client.clientType === "COMPANY" && client.legalForm && (
            <span className="text-muted-foreground">{client.legalForm}</span>
          )}
          {client.email && (
            <span className="text-muted-foreground">{client.email}</span>
          )}
          {client.phone && (
            <span className="text-muted-foreground">{client.phone}</span>
          )}
          {client.website &&
            (websiteHref ? (
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:underline break-all"
              >
                {client.website}
              </a>
            ) : (
              <span className="text-muted-foreground break-all">
                {client.website}
              </span>
            ))}
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

      {client.notes && (
        <div className="mt-4 flex flex-col gap-1 text-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Notes
          </p>
          <p className="whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}

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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { useNewClientForm } from "@/hooks/clients/useNewClientForm";
import { INDUSTRY_LABELS } from "@/types/clients.types";
import type {
  ClientType,
  ClientIndustry,
  NewClientFormProps as Props,
} from "@/types/clients.types";
import { AddressFields } from "../form-fields/AddressFields";
import { BillingFields } from "../form-fields/BillingFields";
import { TtcTagChips } from "@/components/time/tags/TtcTagChips";

export function NewClientForm({ onClose, defaultStatus, title }: Props) {
  const {
    form,
    setField,
    tagIds,
    setTagIds,
    error,
    loading,
    tags,
    handleAddressChange,
    handleBillingChange,
    handleSubmit,
    isCompany,
  } = useNewClientForm(onClose, defaultStatus);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">{title ?? "New client"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Tabs
            value={form.clientType}
            onValueChange={(v) => setField("clientType", v as ClientType)}
          >
            <TabsList>
              <TabsTrigger value="COMPANY">Company</TabsTrigger>
              <TabsTrigger value="INDIVIDUAL">Individual</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-3">
            {isCompany ? (
              <>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="ncf-name">Company name *</Label>
                  <Input
                    id="ncf-name"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Acme Ltd."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="ncf-legalName">Legal name</Label>
                  <Input
                    id="ncf-legalName"
                    value={form.legalName}
                    onChange={(e) => setField("legalName", e.target.value)}
                    placeholder="Acme Limited"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="ncf-vatNumber">VAT number</Label>
                  <Input
                    id="ncf-vatNumber"
                    value={form.vatNumber}
                    onChange={(e) => setField("vatNumber", e.target.value)}
                    placeholder="FR00123456789"
                  />
                </div>
                <div />
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="ncf-firstName">First name *</Label>
                  <Input
                    id="ncf-firstName"
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    placeholder="Jane"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="ncf-lastName">Last name</Label>
                  <Input
                    id="ncf-lastName"
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </>
            )}

            <div className="col-span-2 flex flex-col gap-1">
              <Label htmlFor="ncf-website">Website</Label>
              <Input
                id="ncf-website"
                value={form.website}
                onChange={(e) => setField("website", e.target.value)}
                placeholder="https://acme.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="ncf-industry">Industry</Label>
              <Select
                value={form.industry ?? ""}
                onValueChange={(v) =>
                  setField("industry", (v as ClientIndustry) || null)
                }
              >
                <SelectTrigger id="ncf-industry">
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

            <div className="flex flex-col gap-1">
              <Label htmlFor="ncf-email">
                {isCompany ? "Company email" : "Email"}
              </Label>
              <Input
                id="ncf-email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder={
                  isCompany ? "billing@acme.com" : "jane@example.com"
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="ncf-phone">
                {isCompany ? "Company phone" : "Phone"}
              </Label>
              <Input
                id="ncf-phone"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+33 1 00 00 00 00"
              />
            </div>

            <AddressFields
              address={form.address}
              city={form.city}
              country={form.country}
              postalCode={form.postalCode}
              onChange={handleAddressChange}
              idPrefix="ncf"
            />

            <BillingFields
              paymentDelayDays={form.paymentDelayDays}
              taxRate={form.taxRate}
              billingEndOfMonth={form.billingEndOfMonth}
              onChange={handleBillingChange}
              idPrefix="ncf"
            />

            <div className="col-span-2 pt-4 border-t border-border flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tags
              </p>
              <TtcTagChips
                tagIds={tagIds}
                tags={tags}
                onAdd={(id) => setTagIds((prev) => [...prev, id])}
                onRemove={(id) =>
                  setTagIds((prev) => prev.filter((x) => x !== id))
                }
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

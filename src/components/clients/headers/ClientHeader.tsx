import { useIntl, FormattedMessage } from "react-intl";
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
import {
  INDUSTRY_LABEL_MESSAGES,
  STATUS_LABEL_MESSAGES,
} from "@/constants/clients";
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
import { OccupationChips } from "@/components/occupations/OccupationChips";
import { toSafeHref } from "@/lib/schemas";

const MSG = {
  company: { id: "clients.header.type.company", defaultMessage: "Company" },
  individual: {
    id: "clients.header.type.individual",
    defaultMessage: "Individual",
  },
  notes: { id: "clients.header.notes", defaultMessage: "Notes" },
  status: { id: "clients.header.status", defaultMessage: "Status" },
};

export function ClientHeader({ client, onUpdate, saving }: ClientHeaderProps) {
  const intl = useIntl();
  const {
    editing,
    setEditing,
    tags,
    occupations,
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
  const linkedinHref = toSafeHref(client.linkedinUrl);

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
            <TabsTrigger value="COMPANY">
              <FormattedMessage {...MSG.company} />
            </TabsTrigger>
            <TabsTrigger value="INDIVIDUAL">
              <FormattedMessage {...MSG.individual} />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {intl.formatMessage(isCompany ? MSG.company : MSG.individual)}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {isCompany ? (
                <>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="cl-name">
                      <FormattedMessage
                        id="clients.header.field.name"
                        defaultMessage="Name"
                      />
                    </Label>
                    <Input
                      id="cl-name"
                      value={form.name}
                      onChange={set("name")}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="cl-legalName">
                      <FormattedMessage
                        id="clients.header.field.legalName"
                        defaultMessage="Legal name"
                      />
                    </Label>
                    <Input
                      id="cl-legalName"
                      value={form.legalName}
                      onChange={set("legalName")}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="cl-vatNumber">
                      <FormattedMessage
                        id="clients.header.field.vatNumber"
                        defaultMessage="VAT number"
                      />
                    </Label>
                    <Input
                      id="cl-vatNumber"
                      value={form.vatNumber}
                      onChange={set("vatNumber")}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="cl-legalForm">
                      <FormattedMessage
                        id="clients.header.field.legalForm"
                        defaultMessage="Legal form"
                      />
                    </Label>
                    <Input
                      id="cl-legalForm"
                      value={form.legalForm}
                      onChange={set("legalForm")}
                      placeholder={intl.formatMessage({
                        id: "clients.header.field.legalFormPlaceholder",
                        defaultMessage: "SAS, Ltd, LLC…",
                      })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="cl-firstName">
                      <FormattedMessage
                        id="clients.header.field.firstName"
                        defaultMessage="First name"
                      />
                    </Label>
                    <Input
                      id="cl-firstName"
                      value={form.firstName}
                      onChange={set("firstName")}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="cl-lastName">
                      <FormattedMessage
                        id="clients.header.field.lastName"
                        defaultMessage="Last name"
                      />
                    </Label>
                    <Input
                      id="cl-lastName"
                      value={form.lastName}
                      onChange={set("lastName")}
                    />
                  </div>
                </>
              )}
              <div className="col-span-2 flex flex-col gap-1">
                <Label htmlFor="cl-website">
                  <FormattedMessage
                    id="clients.header.field.website"
                    defaultMessage="Website"
                  />
                </Label>
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
              <div className="col-span-2 flex flex-col gap-1">
                <Label htmlFor="cl-linkedin">
                  <FormattedMessage
                    id="clients.header.field.linkedin"
                    defaultMessage="LinkedIn"
                  />
                </Label>
                <Input
                  id="cl-linkedin"
                  value={form.linkedinUrl}
                  onChange={set("linkedinUrl")}
                  onBlur={touch("linkedinUrl")}
                  placeholder="https://www.linkedin.com/company/…"
                />
                {errors.linkedinUrl && (
                  <span className="text-xs text-destructive">
                    {errors.linkedinUrl}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="cl-industry">
                  <FormattedMessage
                    id="clients.header.field.industry"
                    defaultMessage="Industry"
                  />
                </Label>
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
                    <SelectValue
                      placeholder={intl.formatMessage({
                        id: "clients.header.field.industryPlaceholder",
                        defaultMessage: "Select industry",
                      })}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.keys(INDUSTRY_LABEL_MESSAGES) as ClientIndustry[]
                    ).map((val) => (
                      <SelectItem key={val} value={val}>
                        {intl.formatMessage(INDUSTRY_LABEL_MESSAGES[val])}
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
              <FormattedMessage
                id="clients.header.section.contact"
                defaultMessage="Contact"
              />
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="cl-email">
                  <FormattedMessage
                    id="clients.header.field.email"
                    defaultMessage="Email"
                  />
                </Label>
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
                <Label htmlFor="cl-phone">
                  <FormattedMessage
                    id="clients.header.field.phone"
                    defaultMessage="Phone"
                  />
                </Label>
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
              <FormattedMessage
                id="clients.header.section.address"
                defaultMessage="Address"
              />
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
              <FormattedMessage {...MSG.notes} />
            </p>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cl-notes">
                <FormattedMessage {...MSG.notes} />
              </Label>
              <Textarea
                id="cl-notes"
                value={form.notes}
                onChange={set("notes")}
                placeholder={intl.formatMessage({
                  id: "clients.header.field.notesPlaceholder",
                  defaultMessage: "Internal notes about this client…",
                })}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              <FormattedMessage {...MSG.status} />
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="cl-status">
                  <FormattedMessage {...MSG.status} />
                </Label>
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
                    {(Object.keys(STATUS_LABEL_MESSAGES) as ClientStatus[]).map(
                      (val) => (
                        <SelectItem key={val} value={val}>
                          {intl.formatMessage(STATUS_LABEL_MESSAGES[val])}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="cl-contactedAt">
                  <FormattedMessage
                    id="clients.header.field.contactedAt"
                    defaultMessage="Contacted At"
                  />
                </Label>
                <Input
                  id="cl-contactedAt"
                  type="date"
                  value={form.contactedAt}
                  onChange={set("contactedAt")}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="cl-toRecontactAt">
                  <FormattedMessage
                    id="clients.header.field.toRecontactAt"
                    defaultMessage="To recontact at"
                  />
                </Label>
                <Input
                  id="cl-toRecontactAt"
                  type="date"
                  value={form.toRecontactAt}
                  onChange={set("toRecontactAt")}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <FormattedMessage
                id="clients.header.field.tags"
                defaultMessage="Tags"
              />
            </p>
            <TtcTagChips
              tagIds={form.tagIds}
              tags={tags}
              onChange={(tagIds) => setForm((prev) => ({ ...prev, tagIds }))}
            />
          </div>

          <div className="pt-4 border-t border-border flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <FormattedMessage
                id="clients.header.field.occupations"
                defaultMessage="Occupations"
              />
            </p>
            <OccupationChips
              occupationIds={form.occupationIds}
              occupations={occupations}
              linkedOccupations={client.occupations}
              onChange={(occupationIds) =>
                setForm((prev) => ({ ...prev, occupationIds }))
              }
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? (
              <FormattedMessage
                id="clients.header.saving"
                defaultMessage="Saving…"
              />
            ) : (
              <FormattedMessage
                id="clients.header.save"
                defaultMessage="Save"
              />
            )}
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
            <FormattedMessage
              id="clients.header.cancel"
              defaultMessage="Cancel"
            />
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
              {intl.formatMessage(
                client.clientType === "COMPANY" ? MSG.company : MSG.individual,
              )}
            </Badge>
            <Badge variant="outline">
              {intl.formatMessage(STATUS_LABEL_MESSAGES[client.status])}
            </Badge>
            {client.hubspotId && (
              <Badge variant="secondary">
                <FormattedMessage
                  id="clients.header.hubspotLinked"
                  defaultMessage="HubSpot linked"
                />
              </Badge>
            )}
          </div>
          {client.contactedAt && (
            <p className="text-muted-foreground text-xs mt-1">
              <FormattedMessage
                id="clients.header.lastContacted"
                defaultMessage="Last contacted: {date}"
                values={{
                  date: intl.formatDate(client.contactedAt),
                }}
              />
            </p>
          )}
          {client.toRecontactAt && (
            <p className="text-muted-foreground text-xs mt-1">
              <FormattedMessage
                id="clients.header.toRecontactOn"
                defaultMessage="To recontact on: {date}"
                values={{
                  date: intl.formatDate(client.toRecontactAt),
                }}
              />
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-600 dark:border-blue-400 text-foreground hover:bg-blue-500/30 hover:text-foreground dark:hover:bg-blue-400/30 dark:hover:text-foreground"
          onClick={() => setEditing(true)}
        >
          <FormattedMessage id="clients.header.edit" defaultMessage="Edit" />
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-6 text-sm">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {client.clientType === "COMPANY" ? (
              <FormattedMessage {...MSG.company} />
            ) : (
              <FormattedMessage
                id="clients.header.contactColumnLabel"
                defaultMessage="Contact"
              />
            )}
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
              <FormattedMessage
                id="clients.header.vat"
                defaultMessage="VAT {number}"
                values={{ number: client.vatNumber }}
              />
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
          {linkedinHref && (
            <a
              href={linkedinHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:underline w-fit"
            >
              <FormattedMessage
                id="clients.header.linkedinLink"
                defaultMessage="LinkedIn"
              />
            </a>
          )}
          {client.industry && (
            <Badge variant="outline" className="w-fit text-xs">
              {intl.formatMessage(INDUSTRY_LABEL_MESSAGES[client.industry])}
            </Badge>
          )}
        </div>

        {hasBilling(client) && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              <FormattedMessage
                id="clients.header.section.billing"
                defaultMessage="Billing"
              />
            </p>
            {client.paymentDelayDays !== null && (
              <span>
                <FormattedMessage
                  id="clients.header.paymentDelay"
                  defaultMessage="Payment: {days} days"
                  values={{ days: client.paymentDelayDays }}
                />
              </span>
            )}
            {client.taxRate !== null && (
              <span>
                <FormattedMessage
                  id="clients.header.taxRate"
                  defaultMessage="Tax: {rate}%"
                  values={{ rate: client.taxRate }}
                />
              </span>
            )}
            {client.billingEndOfMonth && (
              <span className="text-muted-foreground">
                <FormattedMessage
                  id="clients.header.endOfMonth"
                  defaultMessage="End of month"
                />
              </span>
            )}
          </div>
        )}
      </div>

      {client.notes && (
        <div className="mt-4 flex flex-col gap-1 text-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <FormattedMessage {...MSG.notes} />
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

      {client.occupations && client.occupations.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {client.occupations.map((a) => (
            <Badge key={a.id} variant="outline" className="text-xs">
              {a.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

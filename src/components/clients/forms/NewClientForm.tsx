import { useIntl, FormattedMessage } from "react-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { useNewClientForm } from "@/hooks/clients/useNewClientForm";
import { INDUSTRY_LABEL_MESSAGES } from "@/constants/clients";
import type {
  ClientType,
  ClientIndustry,
  NewClientFormProps as Props,
} from "@/types/clients.types";
import { AddressFields } from "../form-fields/AddressFields";
import { BillingFields } from "../form-fields/BillingFields";
import { ColorField } from "../form-fields/ColorField";
import { TtcTagChips } from "@/components/time/tags/TtcTagChips";
import { OccupationChips } from "@/components/occupations/OccupationChips";

export function NewClientForm({ onClose, defaultStatus, title }: Props) {
  const intl = useIntl();
  const {
    form,
    setField,
    tagIds,
    setTagIds,
    occupationIds,
    setOccupationIds,
    error,
    loading,
    tags,
    occupations,
    handleAddressChange,
    handleBillingChange,
    handleSubmit,
    isCompany,
  } = useNewClientForm(onClose, defaultStatus);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">
          {title ?? (
            <FormattedMessage
              id="clients.newClientForm.title"
              defaultMessage="New client"
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Tabs
            value={form.clientType}
            onValueChange={(v) => setField("clientType", v as ClientType)}
          >
            <TabsList>
              <TabsTrigger value="COMPANY">
                <FormattedMessage
                  id="clients.newClientForm.company"
                  defaultMessage="Company"
                />
              </TabsTrigger>
              <TabsTrigger value="INDIVIDUAL">
                <FormattedMessage
                  id="clients.newClientForm.individual"
                  defaultMessage="Individual"
                />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-3">
            {isCompany ? (
              <>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="ncf-name">
                    <FormattedMessage
                      id="clients.newClientForm.companyName"
                      defaultMessage="Company name *"
                    />
                  </Label>
                  <Input
                    id="ncf-name"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Acme Ltd."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="ncf-legalName">
                    <FormattedMessage
                      id="clients.newClientForm.legalName"
                      defaultMessage="Legal name"
                    />
                  </Label>
                  <Input
                    id="ncf-legalName"
                    value={form.legalName}
                    onChange={(e) => setField("legalName", e.target.value)}
                    placeholder="Acme Limited"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="ncf-vatNumber">
                    <FormattedMessage
                      id="clients.newClientForm.vatNumber"
                      defaultMessage="VAT number"
                    />
                  </Label>
                  <Input
                    id="ncf-vatNumber"
                    value={form.vatNumber}
                    onChange={(e) => setField("vatNumber", e.target.value)}
                    placeholder="FR00123456789"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="ncf-legalForm">
                    <FormattedMessage
                      id="clients.newClientForm.legalForm"
                      defaultMessage="Legal form"
                    />
                  </Label>
                  <Input
                    id="ncf-legalForm"
                    value={form.legalForm}
                    onChange={(e) => setField("legalForm", e.target.value)}
                    placeholder="SAS, Ltd, LLC…"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="ncf-firstName">
                    <FormattedMessage
                      id="clients.newClientForm.firstName"
                      defaultMessage="First name *"
                    />
                  </Label>
                  <Input
                    id="ncf-firstName"
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    placeholder="Jane"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="ncf-lastName">
                    <FormattedMessage
                      id="clients.newClientForm.lastName"
                      defaultMessage="Last name"
                    />
                  </Label>
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
              <Label htmlFor="ncf-website">
                <FormattedMessage
                  id="clients.newClientForm.website"
                  defaultMessage="Website"
                />
              </Label>
              <Input
                id="ncf-website"
                value={form.website}
                onChange={(e) => setField("website", e.target.value)}
                placeholder="https://acme.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="ncf-industry">
                <FormattedMessage
                  id="clients.newClientForm.industry"
                  defaultMessage="Industry"
                />
              </Label>
              <Select
                value={form.industry ?? ""}
                onValueChange={(v) =>
                  setField("industry", (v as ClientIndustry) || null)
                }
              >
                <SelectTrigger id="ncf-industry">
                  <SelectValue
                    placeholder={intl.formatMessage({
                      id: "clients.newClientForm.industryPlaceholder",
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
              id="ncf-color"
              value={form.color}
              onChange={(v) => setField("color", v)}
            />

            <div className="flex flex-col gap-1">
              <Label htmlFor="ncf-email">
                {intl.formatMessage(
                  isCompany
                    ? {
                        id: "clients.newClientForm.companyEmail",
                        defaultMessage: "Company email",
                      }
                    : {
                        id: "clients.newClientForm.email",
                        defaultMessage: "Email",
                      },
                )}
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
                {intl.formatMessage(
                  isCompany
                    ? {
                        id: "clients.newClientForm.companyPhone",
                        defaultMessage: "Company phone",
                      }
                    : {
                        id: "clients.newClientForm.phone",
                        defaultMessage: "Phone",
                      },
                )}
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
              addressLine2={form.addressLine2}
              city={form.city}
              country={form.country}
              state={form.state}
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

            <div className="col-span-2 flex flex-col gap-1">
              <Label htmlFor="ncf-notes">
                <FormattedMessage
                  id="clients.newClientForm.notes"
                  defaultMessage="Notes"
                />
              </Label>
              <Textarea
                id="ncf-notes"
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder={intl.formatMessage({
                  id: "clients.newClientForm.notesPlaceholder",
                  defaultMessage: "Internal notes about this client…",
                })}
              />
            </div>

            <div className="col-span-2 pt-4 border-t border-border flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <FormattedMessage
                  id="clients.newClientForm.tags"
                  defaultMessage="Tags"
                />
              </p>
              <TtcTagChips tagIds={tagIds} tags={tags} onChange={setTagIds} />
            </div>

            <div className="col-span-2 pt-4 border-t border-border flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <FormattedMessage
                  id="clients.newClientForm.occupations"
                  defaultMessage="Occupations"
                />
              </p>
              <OccupationChips
                occupationIds={occupationIds}
                occupations={occupations}
                onChange={setOccupationIds}
              />
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
          <p className="text-xs text-muted-foreground">
            <FormattedMessage
              id="clients.newClientForm.contactsHint"
              defaultMessage="Add contacts from the client detail page after creation."
            />
          </p>
          <Button type="submit" disabled={loading} className="self-end">
            {loading ? (
              <FormattedMessage
                id="clients.newClientForm.creating"
                defaultMessage="Creating…"
              />
            ) : (
              <FormattedMessage
                id="clients.newClientForm.createClient"
                defaultMessage="Create client"
              />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

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
import { CURRENCIES } from "@/constants/invoices";
import type { InvoiceMetaCardProps as Props } from "@/types/invoices.types";
import { useAllClients } from "@/hooks/clients/useClients";
import { useInvoiceMetaEdit } from "@/hooks/invoices/useInvoiceMetaEdit";

export function InvoiceMetaCard({
  clientId,
  currency,
  dueDate,
  notes,
  onUpdate,
}: Props) {
  const intl = useIntl();
  const { clients } = useAllClients();
  const { editing, saving, form, setForm, openEdit, cancelEdit, handleSave } =
    useInvoiceMetaEdit({ clientId, currency, dueDate, notes, onUpdate });

  const clientName =
    clientId != null
      ? (clients.find((c) => c.id === clientId)?.name ??
        intl.formatMessage(
          {
            id: "invoices.metaCard.clientNumber",
            defaultMessage: "Client #{num}",
          },
          { num: clientId },
        ))
      : intl.formatMessage({
          id: "invoices.metaCard.noClient",
          defaultMessage: "No client",
        });

  if (editing) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            <FormattedMessage
              id="invoices.metaCard.title"
              defaultMessage="Invoice details"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">
              <FormattedMessage
                id="invoices.metaCard.client"
                defaultMessage="Client"
              />
            </Label>
            <Select
              value={form.clientId}
              onValueChange={(v) => setForm((f) => ({ ...f, clientId: v }))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue
                  placeholder={intl.formatMessage({
                    id: "invoices.metaCard.noClient",
                    defaultMessage: "No client",
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <FormattedMessage
                    id="invoices.metaCard.noClient"
                    defaultMessage="No client"
                  />
                </SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-xs">
              <FormattedMessage
                id="invoices.metaCard.currency"
                defaultMessage="Currency"
              />
            </Label>
            <Select
              value={form.currency}
              onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((cur) => (
                  <SelectItem key={cur} value={cur}>
                    {cur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-xs">
              <FormattedMessage
                id="invoices.metaCard.dueDate"
                defaultMessage="Due date"
              />
            </Label>
            <Input
              type="date"
              className="h-8 text-sm"
              value={form.dueDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, dueDate: e.target.value }))
              }
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <Label className="text-xs">
              <FormattedMessage
                id="invoices.metaCard.notes"
                defaultMessage="Notes"
              />
            </Label>
            <Textarea
              rows={3}
              className="text-sm resize-none"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder={intl.formatMessage({
                id: "invoices.metaCard.notesPlaceholder",
                defaultMessage: "Internal notes…",
              })}
            />
          </div>

          <div className="col-span-2 flex gap-2">
            <Button
              size="sm"
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {saving ? (
                <FormattedMessage
                  id="invoices.metaCard.saving"
                  defaultMessage="Saving…"
                />
              ) : (
                <FormattedMessage
                  id="common.actions.save"
                  defaultMessage="Save"
                />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={cancelEdit}
            >
              <FormattedMessage
                id="common.actions.cancel"
                defaultMessage="Cancel"
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">
          <FormattedMessage
            id="invoices.metaCard.title"
            defaultMessage="Invoice details"
          />
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={openEdit}
          className="h-7 px-2 text-xs border-blue-600 dark:border-blue-400 text-foreground hover:bg-blue-500/30 hover:text-foreground dark:hover:bg-blue-400/30 dark:hover:text-foreground"
        >
          <FormattedMessage id="common.actions.edit" defaultMessage="Edit" />
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <div>
          <span className="text-xs text-muted-foreground">
            <FormattedMessage
              id="invoices.metaCard.client"
              defaultMessage="Client"
            />
          </span>
          <p className={clientId == null ? "text-muted-foreground" : ""}>
            {clientName}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">
            <FormattedMessage
              id="invoices.metaCard.currency"
              defaultMessage="Currency"
            />
          </span>
          <p className="font-mono">{currency}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">
            <FormattedMessage
              id="invoices.metaCard.dueDate"
              defaultMessage="Due date"
            />
          </span>
          <p>
            {dueDate ? (
              dueDate.slice(0, 10)
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">
            <FormattedMessage
              id="invoices.metaCard.notes"
              defaultMessage="Notes"
            />
          </span>
          <p className={notes ? "" : "text-muted-foreground"}>{notes ?? "—"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

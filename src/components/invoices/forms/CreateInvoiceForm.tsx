import { ClientPicker } from "@/components/clients/pickers/ClientPicker";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateInvoiceFormProps as Props } from "@/types/shared-ui.types";
import { useCreateInvoice } from "@/hooks/invoices/useInvoices";

export function CreateInvoiceForm({ onClose, onCreated }: Props) {
  const intl = useIntl();
  const { createInvoice, loading } = useCreateInvoice();
  const [clientId, setClientId] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await createInvoice({
      clientId: clientId ? Number(clientId) : undefined,
      dueDate: dueDate || undefined,
    });
    onClose();
    if (result.id) onCreated(result.id);
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="cif-client">
                <FormattedMessage
                  id="invoices.metaCard.client"
                  defaultMessage="Client"
                />
              </Label>
              <ClientPicker
                id="cif-client"
                value={clientId}
                onChange={setClientId}
                placeholder={intl.formatMessage({
                  id: "invoices.metaCard.noClient",
                  defaultMessage: "No client",
                })}
                noneLabel={intl.formatMessage({
                  id: "invoices.metaCard.noClient",
                  defaultMessage: "No client",
                })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cif-due">
                <FormattedMessage
                  id="invoices.metaCard.dueDate"
                  defaultMessage="Due date"
                />
              </Label>
              <Input
                id="cif-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="self-end">
            {loading ? (
              <FormattedMessage
                id="invoices.createForm.creating"
                defaultMessage="Creating…"
              />
            ) : (
              <FormattedMessage
                id="invoices.createForm.submit"
                defaultMessage="Create invoice"
              />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

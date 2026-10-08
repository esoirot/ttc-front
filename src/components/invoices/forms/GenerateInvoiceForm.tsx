import { ProjectPicker } from "@/components/projects/pickers/ProjectPicker";
import { ClientPicker } from "@/components/clients/pickers/ClientPicker";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GenerateInvoiceFormProps as Props } from "@/types/shared-ui.types";
import { useGenerateInvoice } from "@/hooks/invoices/useInvoices";

export function GenerateInvoiceForm({ onClose, onGenerated }: Props) {
  const intl = useIntl();
  const { generateInvoice, loading } = useGenerateInvoice();
  const [clientId, setClientId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  // The server's reason when it refuses, e.g. "Nothing to invoice: ...".
  const [refusal, setRefusal] = useState<string | null>(null);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!projectId) return;
    setRefusal(null);
    let result: Awaited<ReturnType<typeof generateInvoice>>;
    try {
      result = await generateInvoice({
        projectId: Number(projectId),
        clientId: clientId ? Number(clientId) : undefined,
        dueDate: dueDate || undefined,
      });
    } catch (err) {
      setRefusal(err instanceof Error ? err.message : String(err));
      return;
    }
    onClose();
    if (result.id) onGenerated(result.id);
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="gif-project">
                <FormattedMessage
                  id="invoices.generateForm.projectRequired"
                  defaultMessage="Project *"
                />
              </Label>
              <ProjectPicker
                id="gif-project"
                value={projectId}
                onChange={setProjectId}
                placeholder={intl.formatMessage({
                  id: "invoices.generateForm.selectProject",
                  defaultMessage: "Select project",
                })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="gif-client">
                <FormattedMessage
                  id="invoices.metaCard.client"
                  defaultMessage="Client"
                />
              </Label>
              <ClientPicker
                id="gif-client"
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
              <Label htmlFor="gif-due">
                <FormattedMessage
                  id="invoices.metaCard.dueDate"
                  defaultMessage="Due date"
                />
              </Label>
              <Input
                id="gif-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            <FormattedMessage
              id="invoices.generateForm.description"
              defaultMessage="Invoice line items generated from project pricing (fixed fee, hourly rate, per-word rate) and billable time entries."
            />
          </p>
          {refusal && (
            <Alert variant="destructive">
              <AlertDescription>{refusal}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            disabled={loading || !projectId}
            className="self-end"
          >
            {loading ? (
              <FormattedMessage
                id="invoices.generateForm.generating"
                defaultMessage="Generating…"
              />
            ) : (
              <FormattedMessage
                id="invoices.generateForm.submit"
                defaultMessage="Generate invoice"
              />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

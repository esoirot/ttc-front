import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import type { GenerateInvoiceFormProps as Props } from "@/types/shared-ui.types";
import { useGenerateInvoice } from "@/hooks/invoices/useInvoices";

export function GenerateInvoiceForm({
  clients,
  projects,
  onClose,
  onGenerated,
}: Props) {
  const { generateInvoice, loading } = useGenerateInvoice();
  const [clientId, setClientId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!projectId) return;
    const result = await generateInvoice({
      projectId: Number(projectId),
      clientId: clientId ? Number(clientId) : undefined,
      dueDate: dueDate || undefined,
    });
    onClose();
    if (result.id) onGenerated(result.id);
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="gif-project">Project *</Label>
              <Select
                value={projectId || "__none__"}
                onValueChange={(val) =>
                  setProjectId(val === "__none__" ? "" : val)
                }
              >
                <SelectTrigger id="gif-project" className="w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="gif-client">Client</Label>
              <Select
                value={clientId || "__none__"}
                onValueChange={(val) =>
                  setClientId(val === "__none__" ? "" : val)
                }
              >
                <SelectTrigger id="gif-client" className="w-full">
                  <SelectValue placeholder="No client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No client</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="gif-due">Due date</Label>
              <Input
                id="gif-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Invoice line items generated from project pricing (fixed fee, hourly
            rate, per-word rate) and billable time entries.
          </p>
          <Button
            type="submit"
            disabled={loading || !projectId}
            className="self-end"
          >
            {loading ? "Generating…" : "Generate invoice"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

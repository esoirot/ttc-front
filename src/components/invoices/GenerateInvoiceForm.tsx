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
import { useGenerateInvoice } from "../../hooks/invoices/useInvoices";
import type { Client } from "../../hooks/clients/useClients";
import type { Project } from "../../hooks/projects/useProjects";

type Props = {
  clients: Client[];
  projects: Project[];
  onClose: () => void;
  onGenerated: (id: number) => void;
};

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
  const [hourlyRate, setHourlyRate] = useState("");

  function handleProjectChange(val: string) {
    setProjectId(val === "__none__" ? "" : val);
    if (val && val !== "__none__") {
      const proj = projects.find((p) => String(p.id) === val);
      setHourlyRate(proj?.unitPrice != null ? String(proj.unitPrice) : "");
    } else {
      setHourlyRate("");
    }
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!projectId) return;
    const result = await generateInvoice({
      projectId: Number(projectId),
      clientId: clientId ? Number(clientId) : undefined,
      dueDate: dueDate || undefined,
      hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
    });
    onClose();
    if (result.data?.generateInvoice.id)
      onGenerated(result.data.generateInvoice.id);
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
                onValueChange={handleProjectChange}
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
            <div className="flex flex-col gap-1">
              <Label htmlFor="gif-rate">
                Hourly rate (leave blank to use project rate)
              </Label>
              <Input
                id="gif-rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
            </div>
          </div>
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

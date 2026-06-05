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
import type { CreateInvoiceFormProps as Props } from "@/types/shared-ui.types";
import { useCreateInvoice } from "@/hooks/invoices/useInvoices";

export function CreateInvoiceForm({ clients, onClose, onCreated }: Props) {
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
              <Label htmlFor="cif-client">Client</Label>
              <Select
                value={clientId || "__none__"}
                onValueChange={(val) =>
                  setClientId(val === "__none__" ? "" : val)
                }
              >
                <SelectTrigger id="cif-client" className="w-full">
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
              <Label htmlFor="cif-due">Due date</Label>
              <Input
                id="cif-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="self-end">
            {loading ? "Creating…" : "Create invoice"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

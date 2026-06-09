import { useState, startTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useRateSheets,
  useCreateRateSheet,
  useUpdateRateSheet,
  useDeleteRateSheet,
} from "@/hooks/rate-sheets/useRateSheets";
import { useClients } from "@/hooks/clients/useClients";
import { RateSheetForm } from "../forms/RateSheetForm";
import { RateSheetRow } from "../rows/RateSheetRow";
import type { CreateRateSheetInput } from "@/types/rate-sheets.types";

export function RateSheetList() {
  const { rateSheets, loading } = useRateSheets();
  const { createRateSheet, loading: creating } = useCreateRateSheet();
  const { updateRateSheet, loading: updating } = useUpdateRateSheet();
  const { deleteRateSheet } = useDeleteRateSheet();
  const { clients } = useClients();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  function clientName(clientId: number | null): string | undefined {
    if (clientId == null) return undefined;
    return clients.find((c) => c.id === clientId)?.name;
  }

  async function handleCreate(data: CreateRateSheetInput) {
    await createRateSheet(data);
    setShowForm(false);
  }

  async function handleUpdate(id: number, data: CreateRateSheetInput) {
    await updateRateSheet({ id, ...data });
    setEditingId(null);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2 mt-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {rateSheets.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No rate sheets yet. Create your first translation rate sheet below.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-0">
          {rateSheets.map((sheet) =>
            editingId === sheet.id ? (
              <div key={sheet.id} className="py-4 border-b border-border">
                <RateSheetForm
                  initial={sheet}
                  onSave={(data) => void handleUpdate(sheet.id, data)}
                  onCancel={() => setEditingId(null)}
                  saving={updating}
                />
              </div>
            ) : (
              <RateSheetRow
                key={sheet.id}
                sheet={sheet}
                clientName={clientName(sheet.clientId)}
                onEdit={() => {
                  startTransition(() => {
                    setShowForm(false);
                    setEditingId(sheet.id);
                  });
                }}
                onDelete={() => void deleteRateSheet(sheet.id)}
              />
            ),
          )}
        </div>
      )}

      {showForm ? (
        <div className="mt-4">
          <RateSheetForm
            onSave={(data) => void handleCreate(data)}
            onCancel={() => setShowForm(false)}
            saving={creating}
          />
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => {
            startTransition(() => {
              setEditingId(null);
              setShowForm(true);
            });
          }}
        >
          + New Rate Sheet
        </Button>
      )}
    </div>
  );
}

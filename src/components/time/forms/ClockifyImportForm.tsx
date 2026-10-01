import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import type { ClockifyImportFormProps } from "@/types/time-entries.types";
import { useImportClockifyEntries } from "@/hooks/integrations/useClockify";
import { toEndIso, toStartIso } from "@/lib/time";

export function ClockifyImportForm({
  workspaceId,
  refetch,
  onClose,
}: ClockifyImportFormProps) {
  const importMutation = useImportClockifyEntries(workspaceId);
  const [importFrom, setImportFrom] = useState(() =>
    new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10),
  );
  const [importTo, setImportTo] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);

  async function handleImport(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setImportResult(null);
    try {
      const result = await importMutation.mutateAsync({
        start: toStartIso(importFrom),
        end: toEndIso(importTo),
      });
      setImportResult(result);
      void refetch();
    } catch {
      /* error state is surfaced via importMutation.error */
    }
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <form
          onSubmit={(e) => void handleImport(e)}
          className="flex flex-col gap-3"
        >
          <p className="text-sm font-medium">
            <FormattedMessage
              id="time.clockifyImport.title"
              defaultMessage="Import Clockify entries into TTC"
            />
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="ci-from">
                <FormattedMessage
                  id="time.clockifyImport.from"
                  defaultMessage="From"
                />
              </Label>
              <Input
                id="ci-from"
                type="date"
                value={importFrom}
                max={importTo}
                onChange={(e) => setImportFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="ci-to">
                <FormattedMessage
                  id="time.clockifyImport.to"
                  defaultMessage="To"
                />
              </Label>
              <Input
                id="ci-to"
                type="date"
                value={importTo}
                min={importFrom}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setImportTo(e.target.value)}
              />
            </div>
          </div>
          {importResult && (
            <Alert className="text-sm">
              <FormattedMessage
                id="time.clockifyImport.result"
                defaultMessage="Imported {imported}, skipped {skipped} (already in TTC)."
                values={{
                  imported: importResult.imported,
                  skipped: importResult.skipped,
                }}
              />
            </Alert>
          )}
          {importMutation.error && (
            <Alert className="text-sm text-destructive">
              {importMutation.error.message}
            </Alert>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              <FormattedMessage
                id="common.actions.cancel"
                defaultMessage="Cancel"
              />
            </Button>
            <Button
              type="submit"
              disabled={importMutation.isPending}
              className="self-end"
            >
              {importMutation.isPending ? (
                <FormattedMessage
                  id="time.clockifyImport.importing"
                  defaultMessage="Importing…"
                />
              ) : (
                <FormattedMessage
                  id="time.clockifyImport.import"
                  defaultMessage="Import"
                />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import { Button } from "@/components/ui/button";

export function TimePageHeader({
  workspaceId,
  showManual,
  showImport,
  onToggleManual,
  onToggleImport,
}: {
  workspaceId: string | null;
  showManual: boolean;
  showImport: boolean;
  onToggleManual: () => void;
  onToggleImport: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Time Entries</h1>
      <div className="flex gap-2">
        {workspaceId && (
          <Button variant="outline" size="sm" onClick={onToggleImport}>
            {showImport ? "Cancel import" : "Import from Clockify"}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onToggleManual}>
          {showManual ? "Cancel" : "Log entry"}
        </Button>
      </div>
    </div>
  );
}

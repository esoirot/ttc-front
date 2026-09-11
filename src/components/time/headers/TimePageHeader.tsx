import { useIntl } from "react-intl";
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
  const intl = useIntl();
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">
        {intl.formatMessage({
          id: "time.pageHeader.title",
          defaultMessage: "Time Entries",
        })}
      </h1>
      <div className="flex gap-2">
        {workspaceId && (
          <Button variant="outline" size="sm" onClick={onToggleImport}>
            {showImport
              ? intl.formatMessage({
                  id: "time.pageHeader.cancelImport",
                  defaultMessage: "Cancel import",
                })
              : intl.formatMessage({
                  id: "time.pageHeader.importFromClockify",
                  defaultMessage: "Import from Clockify",
                })}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onToggleManual}>
          {showManual
            ? intl.formatMessage({
                id: "common.actions.cancel",
                defaultMessage: "Cancel",
              })
            : intl.formatMessage({
                id: "time.pageHeader.logEntry",
                defaultMessage: "Log entry",
              })}
        </Button>
      </div>
    </div>
  );
}

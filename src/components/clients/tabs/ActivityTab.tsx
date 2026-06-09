import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityTabProps } from "@/types/clients.types";
import { InvoiceRow } from "../rows/InvoiceRow";
import { formatDurationWithoutSeconds } from "@/lib/time";

export function ActivityTab({
  invoices,
  invoicesLoading,
  totalSeconds,
  timeLoading,
  hasProjects,
}: ActivityTabProps) {
  return (
    <>
      <h3 className="text-sm font-semibold mb-3">Invoices</h3>
      {invoicesLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <p className="text-muted-foreground text-sm">No invoices yet.</p>
      ) : (
        <div className="flex flex-col">
          {invoices.map((inv) => (
            <InvoiceRow key={inv.id} inv={inv} />
          ))}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-2">Time logged</h3>
        {timeLoading ? (
          <Skeleton className="h-6 w-24" />
        ) : !hasProjects ? (
          <p className="text-muted-foreground text-sm">No projects linked.</p>
        ) : totalSeconds === 0 ? (
          <p className="text-muted-foreground text-sm">No time logged.</p>
        ) : (
          <p className="font-mono text-sm">
            {formatDurationWithoutSeconds(totalSeconds)}
          </p>
        )}
      </div>
    </>
  );
}

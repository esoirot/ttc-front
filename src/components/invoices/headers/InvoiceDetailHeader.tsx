import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { InvoiceDetailHeaderProps as Props } from "@/types/invoices.types";
import { STATUS_BADGE, STATUS_TRANSITIONS } from "@/constants/invoices";
import { toSafeHttpsSrc } from "@/lib/schemas";

export function InvoiceDetailHeader({
  number,
  status,
  dueDate,
  logoUrl,
  downloading,
  onStatusChange,
  onDownloadPdf,
  onDelete,
}: Props) {
  const transitions = STATUS_TRANSITIONS[status] ?? [];
  const logoSrc = toSafeHttpsSrc(logoUrl);

  return (
    <>
      {logoSrc && (
        <div className="flex justify-end mb-4">
          <img
            src={logoSrc}
            alt="Company logo"
            className="max-h-12 max-w-[110px] object-contain"
          />
        </div>
      )}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono">{number}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={STATUS_BADGE[status]}>{status}</Badge>
            {dueDate && (
              <span className="text-sm text-muted-foreground">
                Due {dueDate.slice(0, 10)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {transitions.map((next) => (
            <Button
              key={next}
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(next)}
            >
              Mark {next}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadPdf}
            disabled={downloading}
          >
            {downloading ? "Generating…" : "Download PDF"}
          </Button>
          {status === "DRAFT" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Delete <strong>{number}</strong>? This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={onDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </>
  );
}

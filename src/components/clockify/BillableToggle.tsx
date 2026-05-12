import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BillableToggle({
  billable,
  onChange,
}: {
  billable: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Button
      type="button"
      size="xs"
      variant="ghost"
      onClick={() => onChange(!billable)}
      title={billable ? "Billable" : "Non-billable"}
      className={cn(
        "px-1.5 font-semibold",
        billable
          ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-100"
          : "text-muted-foreground/40 hover:text-muted-foreground",
      )}
    >
      $
    </Button>
  );
}

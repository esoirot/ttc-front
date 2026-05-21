import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BillableToggle({
  billable,
  disabled,
  onChange,
}: {
  billable: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Button
      type="button"
      size="xs"
      variant="ghost"
      onClick={() => !disabled && onChange(!billable)}
      title={
        disabled
          ? "Billability editing not available on your Clockify plan"
          : billable
            ? "Billable"
            : "Non-billable"
      }
      disabled={disabled}
      className={cn(
        "px-1.5 font-semibold",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : billable
            ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-100"
            : "text-muted-foreground/40 hover:text-muted-foreground",
      )}
    >
      $
    </Button>
  );
}

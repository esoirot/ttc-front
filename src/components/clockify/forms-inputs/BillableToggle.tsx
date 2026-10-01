import { useIntl } from "react-intl";
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
  const intl = useIntl();
  return (
    <Button
      type="button"
      size="xs"
      variant="ghost"
      onClick={() => !disabled && onChange(!billable)}
      title={
        disabled
          ? intl.formatMessage({
              id: "clockify.billableToggle.disabled",
              defaultMessage:
                "Billability editing not available on your Clockify plan",
            })
          : billable
            ? intl.formatMessage({
                id: "clockify.billableToggle.billable",
                defaultMessage: "Billable",
              })
            : intl.formatMessage({
                id: "clockify.billableToggle.nonBillable",
                defaultMessage: "Non-billable",
              })
      }
      disabled={disabled}
      className={cn(
        "px-1.5 font-semibold",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : billable
            ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-900/70"
            : "text-muted-foreground/40 hover:text-muted-foreground",
      )}
    >
      $
    </Button>
  );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { BillingFieldsProps } from "@/types/clients.types";

export function BillingFields({
  paymentDelayDays,
  taxRate,
  billingEndOfMonth,
  onChange,
  idPrefix = "billing",
}: BillingFieldsProps) {
  return (
    <div className="col-span-2 flex flex-col gap-3 pt-2 border-t border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Billing
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`${idPrefix}-delay`}>Payment delay (days)</Label>
          <Input
            id={`${idPrefix}-delay`}
            type="number"
            min="0"
            value={paymentDelayDays}
            onChange={(e) => onChange("paymentDelayDays", e.target.value)}
            placeholder="30"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`${idPrefix}-tax`}>Tax rate (%)</Label>
          <Input
            id={`${idPrefix}-tax`}
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxRate}
            onChange={(e) => onChange("taxRate", e.target.value)}
            placeholder="20"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id={`${idPrefix}-eom`}
          checked={billingEndOfMonth}
          onCheckedChange={(checked) =>
            onChange("billingEndOfMonth", !!checked)
          }
        />
        <Label htmlFor={`${idPrefix}-eom`} className="cursor-pointer">
          Bill at end of month
        </Label>
      </div>
    </div>
  );
}

import { useIntl, type MessageDescriptor } from "react-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortDirection = "asc" | "desc";

/** A "Sort" field picker and an "Order" (ascending / descending) picker. */
export function SortControls<F extends string>({
  idPrefix,
  fields,
  fieldLabels,
  field,
  direction,
  onFieldChange,
  onDirectionChange,
}: {
  idPrefix: string;
  fields: readonly F[];
  fieldLabels: Record<F, MessageDescriptor>;
  field: F;
  direction: SortDirection;
  onFieldChange: (field: F) => void;
  onDirectionChange: (direction: SortDirection) => void;
}) {
  const intl = useIntl();
  return (
    <>
      <div className="flex flex-col gap-1">
        <Label
          htmlFor={`${idPrefix}-sort-field`}
          className="text-xs text-muted-foreground"
        >
          {intl.formatMessage({ id: "sort.field", defaultMessage: "Sort" })}
        </Label>
        <Select value={field} onValueChange={(v) => onFieldChange(v as F)}>
          <SelectTrigger
            id={`${idPrefix}-sort-field`}
            className="w-full sm:w-36"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fields.map((f) => (
              <SelectItem key={f} value={f}>
                {intl.formatMessage(fieldLabels[f])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label
          htmlFor={`${idPrefix}-sort-direction`}
          className="text-xs text-muted-foreground"
        >
          {intl.formatMessage({
            id: "sort.direction",
            defaultMessage: "Order",
          })}
        </Label>
        <Select
          value={direction}
          onValueChange={(v) => onDirectionChange(v as SortDirection)}
        >
          <SelectTrigger
            id={`${idPrefix}-sort-direction`}
            className="w-full sm:w-32"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">
              {intl.formatMessage({
                id: "sort.descending",
                defaultMessage: "Descending",
              })}
            </SelectItem>
            <SelectItem value="asc">
              {intl.formatMessage({
                id: "sort.ascending",
                defaultMessage: "Ascending",
              })}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

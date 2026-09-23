import { useIntl } from "react-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TASK_SORT_FIELDS,
  TASK_SORT_FIELD_LABEL_MESSAGES,
} from "@/constants/tasks";
import type { TaskSortField, TaskSortDirection } from "@/types/tasks.types";
import type { TaskSortControlsProps } from "@/types/projects.types";

export function TaskSortControls({
  field,
  direction,
  onFieldChange,
  onDirectionChange,
  idPrefix,
}: TaskSortControlsProps) {
  const intl = useIntl();
  return (
    <>
      <div className="flex flex-col gap-1">
        <Label
          htmlFor={`${idPrefix}-sort-field`}
          className="text-xs text-muted-foreground"
        >
          Sort
        </Label>
        <Select
          value={field}
          onValueChange={(v) => onFieldChange(v as TaskSortField)}
        >
          <SelectTrigger
            id={`${idPrefix}-sort-field`}
            className="w-full sm:w-36"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_SORT_FIELDS.map((f) => (
              <SelectItem key={f} value={f}>
                {intl.formatMessage(TASK_SORT_FIELD_LABEL_MESSAGES[f])}
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
          Order
        </Label>
        <Select
          value={direction}
          onValueChange={(v) => onDirectionChange(v as TaskSortDirection)}
        >
          <SelectTrigger
            id={`${idPrefix}-sort-direction`}
            className="w-full sm:w-32"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

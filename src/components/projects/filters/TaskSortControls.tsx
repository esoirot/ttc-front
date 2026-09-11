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
      <Label htmlFor={`${idPrefix}-sort-field`} className="text-sm shrink-0">
        Sort
      </Label>
      <Select
        value={field}
        onValueChange={(v) => onFieldChange(v as TaskSortField)}
      >
        <SelectTrigger
          id={`${idPrefix}-sort-field`}
          className="h-8 text-sm w-36"
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
      <Label
        htmlFor={`${idPrefix}-sort-direction`}
        className="text-sm shrink-0"
      >
        Order
      </Label>
      <Select
        value={direction}
        onValueChange={(v) => onDirectionChange(v as TaskSortDirection)}
      >
        <SelectTrigger
          id={`${idPrefix}-sort-direction`}
          className="h-8 text-sm w-32"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Descending</SelectItem>
          <SelectItem value="asc">Ascending</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}

import { SortControls } from "@/components/sort/SortControls";
import {
  TASK_SORT_FIELDS,
  TASK_SORT_FIELD_LABEL_MESSAGES,
} from "@/constants/tasks";
import type { TaskSortControlsProps } from "@/types/projects.types";

export function TaskSortControls(props: TaskSortControlsProps) {
  return (
    <SortControls
      {...props}
      fields={TASK_SORT_FIELDS}
      fieldLabels={TASK_SORT_FIELD_LABEL_MESSAGES}
    />
  );
}

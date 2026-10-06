import { SearchSelect } from "@/components/pickers/SearchSelect";
import { useSearchSelectState } from "@/components/pickers/useSearchSelectState";
import { useTask, useTaskOptions } from "@/hooks/tasks/useTasks";
import type { TaskPickerProps } from "@/types/shared-ui.types";

export function TaskPicker({
  projectId,
  defaultOpen,
  onOpenChange,
  ...props
}: TaskPickerProps) {
  const state = useSearchSelectState({ defaultOpen, onOpenChange });
  const { tasks, loading } = useTaskOptions(projectId, state.query, state.open);
  const { task } = useTask(Number(props.value) || 0);

  return (
    <SearchSelect
      {...props}
      open={state.open}
      onOpenChange={state.setOpen}
      search={state.search}
      onSearchChange={state.setSearch}
      options={tasks.map((t) => ({ value: String(t.id), label: t.title }))}
      selectedLabel={task?.title}
      loading={loading}
    />
  );
}

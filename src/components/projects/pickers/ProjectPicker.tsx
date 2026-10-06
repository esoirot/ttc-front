import { SearchSelect } from "@/components/pickers/SearchSelect";
import { useSearchSelectState } from "@/components/pickers/useSearchSelectState";
import { useProject, useProjectOptions } from "@/hooks/projects/useProjects";
import type { EntityPickerProps } from "@/types/shared-ui.types";

export function ProjectPicker({
  defaultOpen,
  onOpenChange,
  ...props
}: EntityPickerProps) {
  const state = useSearchSelectState({ defaultOpen, onOpenChange });
  const { projects, loading } = useProjectOptions(state.query, state.open);
  const { project } = useProject(Number(props.value) || 0);

  return (
    <SearchSelect
      {...props}
      open={state.open}
      onOpenChange={state.setOpen}
      search={state.search}
      onSearchChange={state.setSearch}
      options={projects.map((p) => ({ value: String(p.id), label: p.title }))}
      selectedLabel={project?.title}
      loading={loading}
    />
  );
}

import { SearchSelect } from "@/components/pickers/SearchSelect";
import { useSearchSelectState } from "@/components/pickers/useSearchSelectState";
import { useClient, useClientOptions } from "@/hooks/clients/useClients";
import type { EntityPickerProps } from "@/types/shared-ui.types";

export function ClientPicker({
  defaultOpen,
  onOpenChange,
  ...props
}: EntityPickerProps) {
  const state = useSearchSelectState({ defaultOpen, onOpenChange });
  const { clients, loading } = useClientOptions(state.query, state.open);
  const { client } = useClient(Number(props.value) || 0);

  return (
    <SearchSelect
      {...props}
      open={state.open}
      onOpenChange={state.setOpen}
      search={state.search}
      onSearchChange={state.setSearch}
      options={clients.map((c) => ({ value: String(c.id), label: c.name }))}
      selectedLabel={client?.name}
      loading={loading}
    />
  );
}

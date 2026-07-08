import { useState } from "react";

export function useBulkSelection<Id extends number | string>(allIds: Id[]) {
  const [selected, setSelected] = useState<Set<Id>>(new Set());

  function toggle(id: Id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === allIds.length ? new Set() : new Set(allIds),
    );
  }

  function clear() {
    setSelected(new Set());
  }

  return {
    selected,
    toggle,
    toggleAll,
    clear,
    isAllSelected: allIds.length > 0 && selected.size === allIds.length,
  };
}

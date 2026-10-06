import { useEffect, useState } from "react";

/** Open state plus a search box whose value settles 300 ms after typing. */
export function useSearchSelectState({
  defaultOpen = false,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpenState] = useState(defaultOpen);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  function setOpen(next: boolean) {
    setOpenState(next);
    if (!next) setSearch("");
    onOpenChange?.(next);
  }

  return { open, setOpen, search, setSearch, query };
}

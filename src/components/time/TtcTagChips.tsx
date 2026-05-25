import { useState } from "react";
import { useCreateTag } from "../../hooks/tags/useTags";
import type { Tag } from "@/types/tags.types";
import type { TtcTagChipsProps as Props } from "@/types/time-entries.types";
import { Badge } from "@/components/ui/badge";

export function TtcTagChips({ tagIds, tags, onAdd, onRemove }: Props) {
  const { createTag, loading: creating } = useCreateTag();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const active = tagIds
    .map((id) => tags.find((t) => t.id === id))
    .filter((t): t is Tag => t !== undefined);

  const filtered = tags.filter(
    (t) =>
      !tagIds.includes(t.id) &&
      t.name.toLowerCase().includes(query.toLowerCase()),
  );

  const showCreate =
    query.trim().length > 0 &&
    !tags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());

  function handleSelect(id: number) {
    onAdd(id);
    setQuery("");
    setOpen(false);
  }

  function handleCreate() {
    const name = query.trim();
    if (!name || creating) return;
    void createTag(name).then((tag) => {
      onAdd(tag.id);
      setQuery("");
      setOpen(false);
    });
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {active.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="gap-0.5 px-1.5 py-0 text-xs"
        >
          {tag.name}
          <button
            type="button"
            onClick={() => onRemove(tag.id)}
            className="ml-0.5 text-muted-foreground hover:text-destructive leading-none"
          >
            ×
          </button>
        </Badge>
      ))}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="+ tag"
          className="text-xs w-10 focus:w-20 transition-all bg-transparent border-none outline-none text-muted-foreground placeholder:text-muted-foreground/60"
        />
        {open && (filtered.length > 0 || showCreate) && (
          <div className="absolute top-full left-0 mt-1 z-20 min-w-28 bg-popover border border-border rounded shadow-lg py-1">
            {filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                onMouseDown={() => handleSelect(t.id)}
                className="block w-full text-left px-2 py-1 text-xs text-popover-foreground hover:bg-accent"
              >
                {t.name}
              </button>
            ))}
            {showCreate && (
              <button
                type="button"
                onMouseDown={handleCreate}
                disabled={creating}
                className="block w-full text-left px-2 py-1 text-xs text-primary hover:bg-accent disabled:opacity-50"
              >
                {creating ? "Creating…" : `Create "${query.trim()}"`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

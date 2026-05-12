import { useState } from "react";
import { useCreateTag, type ClockifyTag } from "../../hooks/useClockify";

export function TagChips({
  workspaceId,
  tagIds,
  tags,
  onAdd,
  onRemove,
}: {
  workspaceId: string;
  tagIds: string[] | null;
  tags: ClockifyTag[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { mutate: createTag, isPending: creating } = useCreateTag(workspaceId);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const safeTagIds = tagIds ?? [];
  const active = safeTagIds
    .map((id) => tags.find((t) => t.id === id))
    .filter((t): t is ClockifyTag => t !== undefined);

  const filtered = tags.filter(
    (t) =>
      !safeTagIds.includes(t.id) &&
      !t.archived &&
      t.name.toLowerCase().includes(query.toLowerCase()),
  );

  const showCreate = query.trim().length > 0 && filtered.length === 0;

  function handleSelect(id: string) {
    onAdd(id);
    setQuery("");
    setOpen(false);
  }

  function handleCreate() {
    const name = query.trim();
    if (!name || creating) return;
    createTag(name, {
      onSuccess: (newTag) => {
        onAdd(newTag.id);
        setQuery("");
        setOpen(false);
      },
    });
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {active.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
        >
          {tag.name}
          <button
            onClick={() => onRemove(tag.id)}
            className="text-zinc-400 hover:text-red-500 leading-none ml-0.5"
          >
            ×
          </button>
        </span>
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
          onBlur={() => {
            setTimeout(() => setOpen(false), 150);
          }}
          placeholder="+ tag"
          className="text-xs w-10 focus:w-20 transition-all bg-transparent border-none outline-none text-zinc-400 placeholder:text-zinc-400 hover:placeholder:text-zinc-600 focus:text-zinc-700 dark:focus:text-zinc-200"
        />
        {open && (filtered.length > 0 || showCreate) && (
          <div className="absolute top-full left-0 mt-1 z-20 min-w-28 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-lg py-1">
            {filtered.map((t) => (
              <button
                key={t.id}
                onMouseDown={() => handleSelect(t.id)}
                className="block w-full text-left px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                {t.name}
              </button>
            ))}
            {showCreate && (
              <button
                onMouseDown={handleCreate}
                disabled={creating}
                className="block w-full text-left px-2 py-1 text-xs text-violet-600 dark:text-violet-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50"
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

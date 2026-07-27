import { useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import type { Tag } from "@/types/tags.types";
import type { TtcTagChipsProps as Props } from "@/types/time-entries.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useCreateTag } from "@/hooks/tags/useTags";

type PendingNew = { key: string; name: string };

export function TtcTagChips({ tagIds, tags, onChange }: Props) {
  const { createTag } = useCreateTag();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [stagedIds, setStagedIds] = useState<number[]>([]);
  const [pendingNew, setPendingNew] = useState<PendingNew[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const committed = tagIds
    .map((id) => tags.find((t) => t.id === id))
    .filter((t): t is Tag => t !== undefined);

  const trimmedQuery = query.trim();
  const exactMatch =
    tags.some((t) => t.name.toLowerCase() === trimmedQuery.toLowerCase()) ||
    pendingNew.some((p) => p.name.toLowerCase() === trimmedQuery.toLowerCase());
  const showCreate = trimmedQuery.length > 0 && !exactMatch;

  function handleOpenChange(next: boolean) {
    if (next) {
      setStagedIds(tagIds);
      setPendingNew([]);
      setQuery("");
      setSaveError(null);
      setOpen(true);
    } else {
      handleCancel();
    }
  }

  function handleCancel() {
    setOpen(false);
    setStagedIds([]);
    setPendingNew([]);
    setQuery("");
    setSaveError(null);
  }

  function toggleStaged(id: number) {
    setStagedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function stagePendingNew() {
    if (!trimmedQuery) return;
    setPendingNew((prev) => [
      ...prev,
      { key: crypto.randomUUID(), name: trimmedQuery },
    ]);
    setQuery("");
  }

  function removePendingNew(key: string) {
    setPendingNew((prev) => prev.filter((p) => p.key !== key));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);

    const finalStaged = [...stagedIds];
    const remaining = [...pendingNew];

    while (remaining.length > 0) {
      const next = remaining[0];
      try {
        const tag = await createTag(next.name);
        remaining.shift();
        finalStaged.push(tag.id);
        setPendingNew([...remaining]);
        setStagedIds([...finalStaged]);
      } catch {
        setSaveError(
          `Couldn't create "${next.name}". Other staged changes are kept — Save again to retry.`,
        );
        setSaving(false);
        return;
      }
    }

    onChange(finalStaged);
    setOpen(false);
    setStagedIds([]);
    setPendingNew([]);
    setQuery("");
    setSaving(false);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 flex-wrap rounded-md border px-1.5 py-0.5",
        committed.length > 0 ? "border-border" : "border-dashed border-border",
      )}
    >
      {committed.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="gap-0.5 px-1.5 py-0 text-xs"
        >
          {tag.name}
          <button
            type="button"
            onClick={() => onChange(tagIds.filter((id) => id !== tag.id))}
            className="ml-0.5 text-muted-foreground hover:text-destructive leading-none"
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {committed.length > 0 ? (
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground"
              aria-label="Edit tags"
            >
              <PlusIcon />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground font-normal"
            >
              + tag
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search or add tag…"
            />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              {tags.map((t) => (
                <CommandItem
                  key={t.id}
                  value={t.name}
                  data-checked={stagedIds.includes(t.id)}
                  onSelect={() => toggleStaged(t.id)}
                >
                  {t.name}
                </CommandItem>
              ))}
              {showCreate && (
                <CommandItem
                  value={`__create__${trimmedQuery}`}
                  className="text-primary"
                  onSelect={stagePendingNew}
                >
                  Add &quot;{trimmedQuery}&quot;
                </CommandItem>
              )}
            </CommandList>
            {pendingNew.length > 0 && (
              <div className="flex flex-wrap gap-1 border-t border-border p-1.5">
                {pendingNew.map((p) => (
                  <Badge
                    key={p.key}
                    variant="outline"
                    className="gap-0.5 px-1.5 py-0 text-xs"
                  >
                    {p.name}
                    <button
                      type="button"
                      onClick={() => removePendingNew(p.key)}
                      className="ml-0.5 text-muted-foreground hover:text-destructive leading-none"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {saveError && (
              <p className="px-2 pb-1 text-xs text-destructive">{saveError}</p>
            )}
            <div className="flex gap-1.5 border-t border-border p-1.5">
              <Button
                size="sm"
                disabled={saving}
                onClick={() => void handleSave()}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

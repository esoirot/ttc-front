import { useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import type { AnyActivity } from "@/types/activities.types";
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

type ActivityChipsProps = {
  activityIds: number[];
  activities: AnyActivity[];
  // Authoritative { id, name } pairs for activities already linked to the
  // record being edited (e.g. client.activities / project.activities).
  // Used as a fallback so already-committed chips still show their real
  // name even when `activities` (the searchable catalog, loaded
  // separately via useMyActivities()) hasn't resolved yet or is missing
  // an entry — the catalog wins when both have the id.
  linkedActivities?: { id: number; name: string }[];
  onChange: (activityIds: number[]) => void;
};

export function ActivityChips({
  activityIds,
  activities,
  linkedActivities,
  onChange,
}: ActivityChipsProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [stagedIds, setStagedIds] = useState<number[]>([]);

  const nameById = new Map<number, string>(
    (linkedActivities ?? []).map((a) => [a.id, a.name]),
  );
  for (const a of activities) nameById.set(a.id, a.name);

  const committed = activityIds
    .filter((id) => nameById.has(id))
    .map((id) => ({ id, name: nameById.get(id)! }));

  function handleOpenChange(next: boolean) {
    if (next) {
      setStagedIds(activityIds);
      setQuery("");
      setOpen(true);
    } else {
      handleCancel();
    }
  }

  function handleCancel() {
    setOpen(false);
    setStagedIds([]);
    setQuery("");
  }

  function toggleStaged(id: number) {
    setStagedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleSave() {
    onChange(stagedIds);
    setOpen(false);
    setStagedIds([]);
    setQuery("");
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 flex-wrap rounded-md border px-1.5 py-0.5",
        committed.length > 0 ? "border-border" : "border-dashed border-border",
      )}
    >
      {committed.map((activity) => (
        <Badge
          key={activity.id}
          variant="secondary"
          className="gap-0.5 px-1.5 py-0 text-xs"
        >
          {activity.name}
          <button
            type="button"
            onClick={() =>
              onChange(activityIds.filter((id) => id !== activity.id))
            }
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
              aria-label="Edit activities"
            >
              <PlusIcon />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground font-normal"
            >
              + activity
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search activities…"
            />
            <CommandList>
              <CommandEmpty>No activities found.</CommandEmpty>
              {activities.map((a) => (
                <CommandItem
                  key={a.id}
                  value={a.name}
                  data-checked={stagedIds.includes(a.id)}
                  onSelect={() => toggleStaged(a.id)}
                >
                  {a.name}
                </CommandItem>
              ))}
            </CommandList>
            <div className="flex gap-1.5 border-t border-border p-1.5">
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

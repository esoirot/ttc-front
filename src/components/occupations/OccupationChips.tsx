import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { PlusIcon, XIcon } from "lucide-react";
import type { AnyOccupation } from "@/types/occupations.types";
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

type OccupationChipsProps = {
  occupationIds: number[];
  occupations: AnyOccupation[];
  // Authoritative { id, name } pairs for occupations already linked to the
  // record being edited (e.g. client.occupations / project.occupations).
  // Used as a fallback so already-committed chips still show their real
  // name even when `occupations` (the searchable catalog, loaded
  // separately via useMyOccupations()) hasn't resolved yet or is missing
  // an entry — the catalog wins when both have the id.
  linkedOccupations?: { id: number; name: string }[];
  onChange: (occupationIds: number[]) => void;
};

export function OccupationChips({
  occupationIds,
  occupations,
  linkedOccupations,
  onChange,
}: OccupationChipsProps) {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [stagedIds, setStagedIds] = useState<number[]>([]);

  const nameById = new Map<number, string>(
    (linkedOccupations ?? []).map((a) => [a.id, a.name]),
  );
  for (const a of occupations) nameById.set(a.id, a.name);

  const committed = occupationIds
    .filter((id) => nameById.has(id))
    .map((id) => ({ id, name: nameById.get(id)! }));

  function handleOpenChange(next: boolean) {
    if (next) {
      setStagedIds(occupationIds);
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
      {committed.map((occupation) => (
        <Badge
          key={occupation.id}
          variant="secondary"
          className="gap-0.5 px-1.5 py-0 text-xs"
        >
          {occupation.name}
          <Button
            type="button"
            onClick={() =>
              onChange(occupationIds.filter((id) => id !== occupation.id))
            }
            variant="ghost"
            size="icon-xs"
            className="ml-0.5 size-4 rounded-sm text-muted-foreground hover:text-destructive"
          >
            <XIcon className="size-3" />
          </Button>
        </Badge>
      ))}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {committed.length > 0 ? (
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground"
              aria-label={intl.formatMessage({
                id: "occupations.chips.editAria",
                defaultMessage: "Edit occupations",
              })}
            >
              <PlusIcon />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground font-normal"
            >
              <FormattedMessage
                id="occupations.chips.addOccupation"
                defaultMessage="+ occupation"
              />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={intl.formatMessage({
                id: "occupations.chips.searchPlaceholder",
                defaultMessage: "Search occupations…",
              })}
            />
            <CommandList>
              <CommandEmpty>
                <FormattedMessage
                  id="occupations.chips.noneFound"
                  defaultMessage="No occupations found."
                />
              </CommandEmpty>
              {occupations.map((a) => (
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
                <FormattedMessage
                  id="common.actions.save"
                  defaultMessage="Save"
                />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <FormattedMessage
                  id="common.actions.cancel"
                  defaultMessage="Cancel"
                />
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

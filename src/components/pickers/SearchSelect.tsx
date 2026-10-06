import { useIntl } from "react-intl";
import { ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SearchSelectProps } from "@/types/shared-ui.types";

const NONE = "__none__";

/** A select with a search box; the caller filters the options server-side. */
export function SearchSelect({
  value,
  selectedLabel,
  options,
  search,
  onSearchChange,
  onChange,
  open,
  onOpenChange,
  placeholder,
  noneLabel,
  loading,
  id,
  className,
  "aria-label": ariaLabel,
}: SearchSelectProps) {
  const intl = useIntl();
  const label = value
    ? (options.find((o) => o.value === value)?.label ?? selectedLabel ?? "")
    : placeholder;

  function pick(next: string, nextLabel: string | null) {
    onChange(next, nextLabel);
    onOpenChange(false);
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-56 p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={onSearchChange}
            placeholder={intl.formatMessage({
              id: "pickers.search",
              defaultMessage: "Search…",
            })}
          />
          <CommandList>
            <CommandEmpty>
              {loading
                ? intl.formatMessage({
                    id: "pickers.loading",
                    defaultMessage: "Loading…",
                  })
                : intl.formatMessage({
                    id: "pickers.noResults",
                    defaultMessage: "No results.",
                  })}
            </CommandEmpty>
            {noneLabel && options.length > 0 && (
              <CommandItem
                value={NONE}
                data-checked={!value}
                onSelect={() => pick("", null)}
              >
                {noneLabel}
              </CommandItem>
            )}
            {options.map((o) => (
              <CommandItem
                key={o.value}
                value={o.value}
                data-checked={o.value === value}
                onSelect={() => pick(o.value, o.label)}
              >
                {o.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

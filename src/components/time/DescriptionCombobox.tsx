import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DescriptionComboboxProps as Props } from "@/types/time-entries.types";

export function DescriptionCombobox({
  value,
  onChange,
  onEnter,
  recentDescriptions,
  placeholder = "What are you working on?",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = recentDescriptions
    .filter(
      (d) =>
        d.toLowerCase().includes(value.toLowerCase()) &&
        d.toLowerCase() !== value.toLowerCase(),
    )
    .slice(0, 8);

  const showDropdown = open && filtered.length > 0;

  function selectItem(desc: string) {
    onChange(desc);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) {
      if (e.key === "Enter") onEnter?.();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && filtered[activeIndex]) {
        selectItem(filtered[activeIndex]);
      } else {
        setOpen(false);
        onEnter?.();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full"
      />
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-popover border border-border rounded-md shadow-lg py-1 max-h-52 overflow-y-auto">
          {filtered.map((desc, i) => (
            <button
              key={desc}
              type="button"
              onMouseDown={() => selectItem(desc)}
              className={cn(
                "block w-full text-left px-3 py-1.5 text-sm text-popover-foreground hover:bg-accent",
                i === activeIndex && "bg-accent",
              )}
            >
              {desc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

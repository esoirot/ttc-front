import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatTimeWithSeconds(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function applyTimeOfDay(iso: string, hhmmss: string): string | null {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(hhmmss);
  if (!match) return null;
  const d = new Date(iso);
  d.setHours(Number(match[1]), Number(match[2]), Number(match[3] ?? 0), 0);
  return d.toISOString();
}

export function EditableTimeField({
  iso,
  onCommit,
  label,
  isValid,
  className,
}: {
  iso: string;
  onCommit: (newIso: string) => void;
  label: string;
  isValid?: (candidateIso: string) => boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setValue(formatTimeWithSeconds(iso));
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commit() {
    setEditing(false);
    const newIso = applyTimeOfDay(iso, value);
    if (!newIso || newIso === iso) return;
    if (isValid && !isValid(newIso)) return;
    onCommit(newIso);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(false);
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        type="time"
        step={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        onClick={(e) => e.stopPropagation()}
        className={cn("h-7 w-[150px] px-1.5 text-sm font-mono", className)}
      />
    );
  }

  return (
    <span
      className={cn("cursor-text hover:text-foreground/80", className)}
      onClick={(e) => {
        e.stopPropagation();
        startEdit();
      }}
      title={`Click to edit ${label}`}
    >
      {formatTimeWithSeconds(iso)}
    </span>
  );
}

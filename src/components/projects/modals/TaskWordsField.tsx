import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseWordCount } from "@/lib/words";
import type { TaskWordsFieldProps } from "@/types/tasks.types";

// Saves on blur / Enter; empty clears the count, invalid input is explained.
export function TaskWordsField({ id, value, onSave }: TaskWordsFieldProps) {
  const [draft, setDraft] = useState(value != null ? String(value) : "");
  const [invalid, setInvalid] = useState(false);

  function commit() {
    const parsed = parseWordCount(draft);
    if (parsed === "invalid") {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    if (parsed !== value) onSave(parsed);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-xs text-muted-foreground">
          <FormattedMessage id="projects.words.label" defaultMessage="Words" />
        </Label>
        <Input
          id={id}
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
          }}
          aria-invalid={invalid || undefined}
          className="h-7 w-28 text-sm"
        />
      </div>
      {invalid && (
        <p className="text-xs text-destructive">
          <FormattedMessage
            id="projects.words.invalid"
            defaultMessage="Words must be a whole number of 0 or more."
          />
        </p>
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomFieldsInputProps } from "@/types/activities.types";

export function CustomFieldsInput({
  fields,
  onAdd,
  onUpdate,
  onRemove,
}: CustomFieldsInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Custom fields</span>
        <Button type="button" variant="ghost" size="sm" onClick={onAdd}>
          + Add field
        </Button>
      </div>
      {fields.map((cf, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="Field name"
            value={cf.key}
            onChange={(e) => onUpdate(i, "key", e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Value"
            value={cf.value}
            onChange={(e) => onUpdate(i, "value", e.target.value)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remove field"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

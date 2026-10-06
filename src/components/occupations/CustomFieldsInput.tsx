import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomFieldsInputProps } from "@/types/occupations.types";

export function CustomFieldsInput({
  fields,
  onAdd,
  onUpdate,
  onRemove,
}: CustomFieldsInputProps) {
  const intl = useIntl();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          <FormattedMessage
            id="occupations.customFields.title"
            defaultMessage="Custom fields"
          />
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={onAdd}>
          <FormattedMessage
            id="occupations.customFields.addField"
            defaultMessage="+ Add field"
          />
        </Button>
      </div>
      {fields.map((cf, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder={intl.formatMessage({
              id: "occupations.customFields.fieldName",
              defaultMessage: "Field name",
            })}
            value={cf.key}
            onChange={(e) => onUpdate(i, "key", e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder={intl.formatMessage({
              id: "occupations.customFields.fieldValue",
              defaultMessage: "Value",
            })}
            value={cf.value}
            onChange={(e) => onUpdate(i, "value", e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => onRemove(i)}
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-destructive"
            aria-label={intl.formatMessage({
              id: "occupations.customFields.removeField",
              defaultMessage: "Remove field",
            })}
          >
            ✕
          </Button>
        </div>
      ))}
    </div>
  );
}

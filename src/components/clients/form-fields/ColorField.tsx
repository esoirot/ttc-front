import { useIntl } from "react-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRESET_COLORS } from "@/constants/tasks";

export interface ColorFieldProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
  label?: string;
  placeholder?: string;
}

export function ColorField({
  value,
  onChange,
  id,
  label,
  placeholder = "#D2D5DA",
}: ColorFieldProps) {
  const intl = useIntl();
  const resolvedLabel =
    label ??
    intl.formatMessage({
      id: "clients.colorField.label",
      defaultMessage: "Color",
    });
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{resolvedLabel}</Label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={intl.formatMessage({
                id: "clients.colorField.pickColor",
                defaultMessage: "Pick color",
              })}
              className="h-9 w-9 shrink-0 rounded-md border border-border"
              style={{ backgroundColor: value || "transparent" }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="flex flex-wrap gap-1.5 w-40">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    value === c
                      ? "ring-2 ring-offset-1 ring-foreground scale-110"
                      : ""
                  }`}
                  onClick={() => onChange(c)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

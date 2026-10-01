import { useIntl } from "react-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRESET_COLORS } from "@/constants/tasks";
import { Button } from "@/components/ui/button";

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
            <Button
              type="button"
              variant="ghost"
              aria-label={intl.formatMessage({
                id: "clients.colorField.pickColor",
                defaultMessage: "Pick color",
              })}
              className="size-9 shrink-0 rounded-md border border-border p-0 hover:ring-2 hover:ring-ring"
              style={{ backgroundColor: value || "transparent" }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="flex flex-wrap gap-1.5 w-40">
              {PRESET_COLORS.map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant="ghost"
                  aria-label={c}
                  style={{ backgroundColor: c }}
                  className={`size-6 rounded-full p-0 hover:scale-110 ${
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

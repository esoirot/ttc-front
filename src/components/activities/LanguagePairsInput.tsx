import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/constants/languages";
import type { LanguagePairsInputProps } from "@/types/activities.types";

export function LanguagePairsInput({
  pairs,
  onAdd,
  onUpdate,
  onRemove,
}: LanguagePairsInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Languages</span>
        <Button type="button" variant="ghost" size="sm" onClick={onAdd}>
          + Add pair
        </Button>
      </div>
      {pairs.map((pair, i) => {
        const sameLanguage =
          pair.fromLanguage &&
          pair.toLanguage &&
          pair.fromLanguage === pair.toLanguage;
        return (
          <div key={i} className="flex items-center gap-2">
            <Select
              value={pair.fromLanguage}
              onValueChange={(v) => onUpdate(i, "fromLanguage", v)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="From" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label} ({lang.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground text-sm">→</span>
            <Select
              value={pair.toLanguage}
              onValueChange={(v) => onUpdate(i, "toLanguage", v)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="To" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label} ({lang.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove pair"
            >
              ✕
            </button>
            {sameLanguage && (
              <span className="text-xs text-destructive">Same language</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

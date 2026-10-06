import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/constants/languages";
import type { LanguagePairsInputProps } from "@/types/occupations.types";

export function LanguagePairsInput({
  pairs,
  onAdd,
  onUpdate,
  onRemove,
}: LanguagePairsInputProps) {
  const intl = useIntl();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          <FormattedMessage
            id="occupations.languagePairs.title"
            defaultMessage="Languages"
          />
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={onAdd}>
          <FormattedMessage
            id="occupations.languagePairs.addPair"
            defaultMessage="+ Add pair"
          />
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
                <SelectValue
                  placeholder={intl.formatMessage({
                    id: "occupations.languagePairs.from",
                    defaultMessage: "From",
                  })}
                />
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
                <SelectValue
                  placeholder={intl.formatMessage({
                    id: "occupations.languagePairs.to",
                    defaultMessage: "To",
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label} ({lang.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={() => onRemove(i)}
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive"
              aria-label={intl.formatMessage({
                id: "occupations.languagePairs.removePair",
                defaultMessage: "Remove pair",
              })}
            >
              ✕
            </Button>
            {sameLanguage && (
              <span className="text-xs text-destructive">
                <FormattedMessage
                  id="occupations.languagePairs.sameLanguage"
                  defaultMessage="Same language"
                />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

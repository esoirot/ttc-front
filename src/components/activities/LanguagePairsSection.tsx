import { useState } from "react";
import { useUpdateActivity } from "@/hooks/activities/useActivities";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/constants/languages";
import type {
  LanguagePairDraft,
  LanguagePairsSectionProps,
} from "@/types/activities.types";

export function LanguagePairsSection({
  activityId,
  initialPairs,
}: LanguagePairsSectionProps) {
  const { updateActivity, loading: saving } = useUpdateActivity();
  const [pairs, setPairs] = useState<LanguagePairDraft[]>(
    initialPairs.map(({ fromLanguage, toLanguage }) => ({
      fromLanguage,
      toLanguage,
    })),
  );
  const [saved, setSaved] = useState(false);

  function addPair() {
    setPairs((prev) => [...prev, { fromLanguage: "", toLanguage: "" }]);
  }

  function updatePair(
    i: number,
    field: keyof LanguagePairDraft,
    value: string,
  ) {
    setPairs((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)),
    );
  }

  function removePair(i: number) {
    setPairs((prev) => prev.filter((_, idx) => idx !== i));
  }

  function isValid() {
    return pairs.every(
      (p) => p.fromLanguage && p.toLanguage && p.fromLanguage !== p.toLanguage,
    );
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid()) return;
    await updateActivity({ id: activityId, languagePairs: pairs });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-3">
      {pairs.map((pair, i) => {
        const sameLanguage =
          pair.fromLanguage &&
          pair.toLanguage &&
          pair.fromLanguage === pair.toLanguage;
        return (
          <div key={i} className="flex items-center gap-2">
            <Select
              value={pair.fromLanguage}
              onValueChange={(v) => updatePair(i, "fromLanguage", v)}
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
              onValueChange={(v) => updatePair(i, "toLanguage", v)}
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
              onClick={() => removePair(i)}
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
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={addPair}>
          + Add pair
        </Button>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              Saved.
            </span>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={saving || pairs.length === 0 || !isValid()}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}

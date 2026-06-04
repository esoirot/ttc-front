import { useState } from "react";
import { useUpdateActivity } from "@/hooks/activities/useActivities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { centsToEuros, eurosToCents } from "@/lib/currency";
import type { ObjectivesFormProps } from "@/types/activities.types";

export function ObjectivesForm({ activityId, initial }: ObjectivesFormProps) {
  const {
    updateActivity,
    loading: saving,
    error: saveError,
  } = useUpdateActivity();
  const [q1, setQ1] = useState(centsToEuros(initial.objectiveQ1));
  const [q2, setQ2] = useState(centsToEuros(initial.objectiveQ2));
  const [q3, setQ3] = useState(centsToEuros(initial.objectiveQ3));
  const [q4, setQ4] = useState(centsToEuros(initial.objectiveQ4));
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await updateActivity({
      id: activityId,
      objectiveQ1: eurosToCents(q1),
      objectiveQ2: eurosToCents(q2),
      objectiveQ3: eurosToCents(q3),
      objectiveQ4: eurosToCents(q4),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        {(
          [
            ["Q1", q1, setQ1],
            ["Q2", q2, setQ2],
            ["Q3", q3, setQ3],
            ["Q4", q4, setQ4],
          ] as const
        ).map(([label, value, setter]) => (
          <div key={label} className="flex flex-col gap-1.5">
            <Label>{label}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                €
              </span>
              <Input
                value={value}
                onChange={(e) => setter(e.target.value)}
                type="number"
                step="0.01"
                min="0"
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>
        ))}
      </div>
      {saveError && (
        <p className="text-sm text-destructive">{saveError.message}</p>
      )}
      {saved && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Objectives saved.
        </p>
      )}
      <Button type="submit" className="self-start" disabled={saving}>
        {saving ? "Saving…" : "Save objectives"}
      </Button>
    </form>
  );
}

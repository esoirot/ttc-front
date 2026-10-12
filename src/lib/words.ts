/**
 * Word counts are optional whole numbers ≥ 0. Empty input means "not set"
 * (null, which also clears a stored value); anything else is "invalid".
 */
export function parseWordCount(input: string): number | null | "invalid" {
  const v = input.trim();
  if (v === "") return null;
  return /^\d+$/.test(v) ? Number(v) : "invalid";
}

/** A task's own words plus its counted checklist items' words. */
export function taskWordTotal(task: {
  wordCount: number | null;
  subtasks: { wordCount: number | null; countInTotal: boolean }[];
}): number {
  return task.subtasks.reduce(
    (sum, s) => sum + (s.countInTotal ? (s.wordCount ?? 0) : 0),
    task.wordCount ?? 0,
  );
}

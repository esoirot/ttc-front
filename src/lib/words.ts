/**
 * Word counts are optional whole numbers ≥ 0. Empty input means "not set"
 * (null, which also clears a stored value); anything else is "invalid".
 */
export function parseWordCount(input: string): number | null | "invalid" {
  const v = input.trim();
  if (v === "") return null;
  return /^\d+$/.test(v) ? Number(v) : "invalid";
}

/** A task's own words plus all of its checklist items' words. */
export function taskWordTotal(task: {
  wordCount: number | null;
  subtasks: { wordCount: number | null }[];
}): number {
  return (
    (task.wordCount ?? 0) +
    task.subtasks.reduce((sum, s) => sum + (s.wordCount ?? 0), 0)
  );
}

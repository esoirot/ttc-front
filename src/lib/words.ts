/**
 * Word counts are optional whole numbers ≥ 0. Empty input means "not set"
 * (null, which also clears a stored value); anything else is "invalid".
 */
export function parseWordCount(input: string): number | null | "invalid" {
  const v = input.trim();
  if (v === "") return null;
  return /^\d+$/.test(v) ? Number(v) : "invalid";
}

/** A task's own words, its checklist items' words and its time entries' words. */
export function taskWordTotal(task: {
  wordCount: number | null;
  subtasks: { wordCount: number | null }[];
  totalWordsProcessed?: number | null;
}): number {
  return (
    (task.wordCount ?? 0) +
    task.subtasks.reduce((sum, s) => sum + (s.wordCount ?? 0), 0) +
    (task.totalWordsProcessed ?? 0)
  );
}

/** A project's time-entry words plus its tasks' and checklist items' words. */
export function projectWordTotal(project: {
  totalWordsProcessed?: number | null;
  totalTaskWords?: number | null;
}): number {
  return (project.totalWordsProcessed ?? 0) + (project.totalTaskWords ?? 0);
}

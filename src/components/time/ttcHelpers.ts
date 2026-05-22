import type { TimeEntry } from "../../hooks/time/useTimeEntries";

export { formatTime, secsToHms, dayLabel } from "../clockify/helpers";

export function groupByDay(entries: TimeEntry[]): [string, TimeEntry[]][] {
  const map = new Map<string, TimeEntry[]>();
  for (const entry of entries) {
    const key = new Date(entry.startTime).toLocaleDateString("en-CA");
    const group = map.get(key);
    if (group) group.push(entry);
    else map.set(key, [entry]);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export function groupByDescription(
  entries: TimeEntry[],
): [string, TimeEntry[]][] {
  const map = new Map<string, TimeEntry[]>();
  for (const entry of entries) {
    const desc = entry.description?.trim() ?? "";
    const key =
      desc ||
      (entry.projectId != null ? String(entry.projectId) : "__no_desc__");
    const group = map.get(key);
    if (group) group.push(entry);
    else map.set(key, [entry]);
  }
  return [...map.entries()];
}

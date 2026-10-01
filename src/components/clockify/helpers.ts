import type { IntlShape } from "react-intl";
import type { ClockifyTimeEntry } from "@/types/clockify.types";

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function secsToHms(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function dayLabel(dayKey: string, intl: IntlShape): string {
  const now = new Date();
  const todayKey = now.toLocaleDateString("en-CA");
  const yd = new Date(now);
  yd.setDate(yd.getDate() - 1);
  const ydKey = yd.toLocaleDateString("en-CA");
  if (dayKey === todayKey) {
    return intl.formatMessage({
      id: "time.dayLabel.today",
      defaultMessage: "Today",
    });
  }
  if (dayKey === ydKey) {
    return intl.formatMessage({
      id: "time.dayLabel.yesterday",
      defaultMessage: "Yesterday",
    });
  }
  const d = new Date(dayKey + "T12:00:00");
  return intl.formatDate(d, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function groupByDescription(
  entries: ClockifyTimeEntry[],
): [string, ClockifyTimeEntry[]][] {
  const map = new Map<string, ClockifyTimeEntry[]>();
  for (const entry of entries) {
    const desc = entry.description?.trim() ?? "";
    const key = desc || entry.projectId || "__no_desc__";
    const group = map.get(key);
    if (group) group.push(entry);
    else map.set(key, [entry]);
  }
  return [...map.entries()];
}

export function groupByDay(
  entries: ClockifyTimeEntry[],
): [string, ClockifyTimeEntry[]][] {
  const map = new Map<string, ClockifyTimeEntry[]>();
  for (const entry of entries) {
    const key = new Date(entry.timeInterval.start).toLocaleDateString("en-CA");
    const group = map.get(key);
    if (group) group.push(entry);
    else map.set(key, [entry]);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export function todayStr(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString("en-CA");
}

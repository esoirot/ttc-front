import { useProjects } from "@/hooks/projects/useProjects";
import { useTimeEntries } from "@/hooks/time/useTimeEntries";
import { formatDuration } from "@/lib/time";
import type { TimeEntry } from "@/types/time-entries.types";
import { DistributionPie } from "./DistributionPie";

function sumByProject(
  entries: TimeEntry[],
  titleOf: (projectId: number | null) => string,
  valueOf: (e: TimeEntry) => number,
): { name: string; value: number }[] {
  const totals = new Map<string, number>();
  for (const e of entries) {
    const value = valueOf(e);
    if (value <= 0) continue;
    const label = titleOf(e.projectId);
    totals.set(label, (totals.get(label) ?? 0) + value);
  }
  return [...totals.entries()].map(([name, value]) => ({ name, value }));
}

export function ProjectsOverviewCharts() {
  const { projects } = useProjects();

  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  ).toISOString();
  const monthLabel = now.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const { entries: monthlyEntries } = useTimeEntries({
    start: monthStart,
    end: monthEnd,
  });

  const projectTitleById = new Map(projects.map((p) => [p.id, p.title]));
  const titleOf = (projectId: number | null) =>
    projectId != null
      ? (projectTitleById.get(projectId) ?? "Unknown project")
      : "No project";

  const monthlyTimeData = sumByProject(
    monthlyEntries,
    titleOf,
    (e) => e.durationSeconds ?? 0,
  );
  const monthlyWordsData = sumByProject(
    monthlyEntries,
    titleOf,
    (e) => e.wordsProcessed ?? 0,
  );

  const overallTimeData = projects
    .filter((p) => (p.totalTimeSeconds ?? 0) > 0)
    .map((p) => ({ name: p.title, value: p.totalTimeSeconds ?? 0 }));
  const overallWordsData = projects
    .filter((p) => (p.totalWordsProcessed ?? 0) > 0)
    .map((p) => ({ name: p.title, value: p.totalWordsProcessed ?? 0 }));

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <DistributionPie
        title="Time per project"
        subtitle={monthLabel}
        data={monthlyTimeData}
        formatValue={formatDuration}
        emptyMessage="No time logged yet this month."
      />
      <DistributionPie
        title="Time per project"
        subtitle="All time"
        data={overallTimeData}
        formatValue={formatDuration}
        emptyMessage="No time logged yet."
      />
      <DistributionPie
        title="Words per project"
        subtitle={monthLabel}
        data={monthlyWordsData}
        formatValue={(v) => v.toLocaleString()}
        emptyMessage="No words logged yet this month."
      />
      <DistributionPie
        title="Words per project"
        subtitle="All time"
        data={overallWordsData}
        formatValue={(v) => v.toLocaleString()}
        emptyMessage="No words logged yet."
      />
    </div>
  );
}

import { useIntl } from "react-intl";
import { useAllProjects } from "@/hooks/projects/useProjects";
import { useAllTimeEntries } from "@/hooks/time/useTimeEntries";
import { formatDuration } from "@/lib/time";
import type { TimeEntry } from "@/types/time-entries.types";
import type { ProjectsOverviewChartsProps } from "@/types/projects.types";
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

export function ProjectsOverviewCharts({ month }: ProjectsOverviewChartsProps) {
  const intl = useIntl();
  const { projects } = useAllProjects();

  const monthStart = new Date(
    month.getFullYear(),
    month.getMonth(),
    1,
  ).toISOString();
  const monthEnd = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  ).toISOString();
  const monthLabel = intl.formatDate(month, {
    month: "long",
    year: "numeric",
  });

  const { entries: monthlyEntries } = useAllTimeEntries({
    start: monthStart,
    end: monthEnd,
  });

  const unknownProject = intl.formatMessage({
    id: "projects.overviewCharts.unknownProject",
    defaultMessage: "Unknown project",
  });
  const noProject = intl.formatMessage({
    id: "projects.overviewCharts.noProject",
    defaultMessage: "No project",
  });
  const projectTitleById = new Map(projects.map((p) => [p.id, p.title]));
  const titleOf = (projectId: number | null) =>
    projectId != null
      ? (projectTitleById.get(projectId) ?? unknownProject)
      : noProject;

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
        title={intl.formatMessage({
          id: "projects.overviewCharts.timePerProject",
          defaultMessage: "Time per project",
        })}
        subtitle={monthLabel}
        data={monthlyTimeData}
        formatValue={formatDuration}
        emptyMessage={intl.formatMessage(
          {
            id: "projects.overviewCharts.noTimeInMonth",
            defaultMessage: "No time logged in {month}.",
          },
          { month: monthLabel },
        )}
      />
      <DistributionPie
        title={intl.formatMessage({
          id: "projects.overviewCharts.timePerProject",
          defaultMessage: "Time per project",
        })}
        subtitle={intl.formatMessage({
          id: "projects.overviewCharts.allTime",
          defaultMessage: "All time",
        })}
        data={overallTimeData}
        formatValue={formatDuration}
        emptyMessage={intl.formatMessage({
          id: "projects.overviewCharts.noTimeAllTime",
          defaultMessage: "No time logged yet.",
        })}
      />
      <DistributionPie
        title={intl.formatMessage({
          id: "projects.overviewCharts.wordsPerProject",
          defaultMessage: "Words per project",
        })}
        subtitle={monthLabel}
        data={monthlyWordsData}
        formatValue={(v) => intl.formatNumber(v)}
        emptyMessage={intl.formatMessage(
          {
            id: "projects.overviewCharts.noWordsInMonth",
            defaultMessage: "No words logged in {month}.",
          },
          { month: monthLabel },
        )}
      />
      <DistributionPie
        title={intl.formatMessage({
          id: "projects.overviewCharts.wordsPerProject",
          defaultMessage: "Words per project",
        })}
        subtitle={intl.formatMessage({
          id: "projects.overviewCharts.allTime",
          defaultMessage: "All time",
        })}
        data={overallWordsData}
        formatValue={(v) => intl.formatNumber(v)}
        emptyMessage={intl.formatMessage({
          id: "projects.overviewCharts.noWordsAllTime",
          defaultMessage: "No words logged yet.",
        })}
      />
    </div>
  );
}

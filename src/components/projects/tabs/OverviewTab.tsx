import { FormattedMessage, useIntl } from "react-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/lib/time";
import {
  calculateProjectRevenue,
  resolveProjectRateSheet,
} from "@/lib/projectRate";
import { useRateSheets } from "@/hooks/rate-sheets/useRateSheets";
import { useTimeEntries } from "@/hooks/time/useTimeEntries";
import type { TimeEntry } from "@/types/time-entries.types";
import type { OverviewTabProps } from "@/types/projects.types";
import { DistributionPie } from "../charts/DistributionPie";

function sumSecondsByLabel(
  entries: TimeEntry[],
  labelOf: (e: TimeEntry) => string,
): { name: string; value: number }[] {
  const totals = new Map<string, number>();
  for (const e of entries) {
    const seconds = e.durationSeconds ?? 0;
    if (seconds <= 0) continue;
    const label = labelOf(e);
    totals.set(label, (totals.get(label) ?? 0) + seconds);
  }
  return [...totals.entries()].map(([name, value]) => ({ name, value }));
}

export function OverviewTab({ project, totalSeconds }: OverviewTabProps) {
  const intl = useIntl();
  const { rateSheets, loading: rateSheetsLoading } = useRateSheets();
  const clientRateSheet = resolveProjectRateSheet(rateSheets, project);
  const hasCustomPricing =
    project.fixedFee != null ||
    project.hourlyRate != null ||
    project.perWordRate != null;

  const isTranslationActivity =
    project.activities?.some((a) => a.activityType === "TRANSLATOR") ?? false;
  const wordsProcessed = project.totalWordsProcessed ?? 0;
  const showRevenue = isTranslationActivity && wordsProcessed > 0;
  const revenue = showRevenue
    ? calculateProjectRevenue(project, totalSeconds, clientRateSheet)
    : 0;

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
  const monthLabel = intl.formatDate(now, {
    month: "long",
    year: "numeric",
  });

  const { entries: monthlyEntries } = useTimeEntries({
    projectId: project.id,
    start: monthStart,
    end: monthEnd,
  });

  const noTaskLabel = intl.formatMessage({
    id: "time.entryRow.noTask",
    defaultMessage: "No task",
  });
  const noActivityLabel = intl.formatMessage({
    id: "time.entryRow.noActivity",
    defaultMessage: "No activity",
  });
  const taskPieData = sumSecondsByLabel(
    monthlyEntries,
    (e) => e.task?.title ?? noTaskLabel,
  );
  const activityPieData = sumSecondsByLabel(
    monthlyEntries,
    (e) => e.activity?.name ?? noActivityLabel,
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="grid grid-cols-2 gap-4 flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              <FormattedMessage
                id="clients.projectsTab.timeLogged"
                defaultMessage="Time logged"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono">{formatDuration(totalSeconds)}</p>
          </CardContent>
        </Card>
        {project.wordCount && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                <FormattedMessage
                  id="projects.header.field.wordCount"
                  defaultMessage="Word count"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">
                <FormattedMessage
                  id="projects.overviewTab.wordsProgress"
                  defaultMessage="{processed} / {total}"
                  values={{
                    processed: intl.formatNumber(
                      project.totalWordsProcessed ?? 0,
                    ),
                    total: intl.formatNumber(project.wordCount),
                  }}
                />
              </p>
            </CardContent>
          </Card>
        )}
        {(project.useCustomRate ? hasCustomPricing : true) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                <FormattedMessage
                  id="projects.overviewTab.pricing"
                  defaultMessage="Pricing"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {project.useCustomRate ? (
                <>
                  {project.fixedFee != null && (
                    <p className="text-lg">
                      <FormattedMessage
                        id="projects.header.pricing.fixed"
                        defaultMessage="Fixed {fee} {currency}"
                        values={{
                          fee: project.fixedFee,
                          currency: project.currency,
                        }}
                      />
                    </p>
                  )}
                  {project.hourlyRate != null && (
                    <p className="text-lg">
                      <FormattedMessage
                        id="projects.overviewTab.hourlyRate"
                        defaultMessage="{rate} {currency}/hr"
                        values={{
                          rate: project.hourlyRate,
                          currency: project.currency,
                        }}
                      />
                    </p>
                  )}
                  {project.perWordRate != null && (
                    <p className="text-lg">
                      <FormattedMessage
                        id="projects.overviewTab.perWordRate"
                        defaultMessage="{rate} {currency}/word"
                        values={{
                          rate: project.perWordRate,
                          currency: project.currency,
                        }}
                      />
                    </p>
                  )}
                </>
              ) : clientRateSheet ? (
                <>
                  <p className="text-lg">
                    <FormattedMessage
                      id="projects.overviewTab.clientRatePerWord"
                      defaultMessage="{price} {currency}/word"
                      values={{
                        price: clientRateSheet.pricePerWord,
                        currency: clientRateSheet.currency,
                      }}
                    />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <FormattedMessage
                      id="projects.overviewTab.clientRateSheetName"
                      defaultMessage="Client rate sheet — {name}"
                      values={{ name: clientRateSheet.name }}
                    />
                  </p>
                </>
              ) : rateSheetsLoading ? null : (
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage
                    id="projects.header.pricing.noRateSheet"
                    defaultMessage="No client rate sheet for this project"
                  />
                </p>
              )}
            </CardContent>
          </Card>
        )}
        {showRevenue && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                <FormattedMessage
                  id="projects.overviewTab.revenue"
                  defaultMessage="Revenue"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-mono">
                {revenue.toFixed(2)} {project.currency}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:w-72 shrink-0">
        <DistributionPie
          title={intl.formatMessage({
            id: "projects.overviewTab.timePerTask",
            defaultMessage: "Time per task",
          })}
          subtitle={monthLabel}
          data={taskPieData}
          formatValue={formatDuration}
          emptyMessage={intl.formatMessage({
            id: "projects.overviewTab.noTimeThisMonth",
            defaultMessage: "No time logged yet this month.",
          })}
        />
        <DistributionPie
          title={intl.formatMessage({
            id: "projects.overviewTab.timePerActivity",
            defaultMessage: "Time per activity",
          })}
          subtitle={monthLabel}
          data={activityPieData}
          formatValue={formatDuration}
          emptyMessage={intl.formatMessage({
            id: "projects.overviewTab.noTimeThisMonth",
            defaultMessage: "No time logged yet this month.",
          })}
        />
      </div>
    </div>
  );
}

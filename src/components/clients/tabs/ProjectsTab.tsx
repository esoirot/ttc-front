import { Link } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@/types/projects.types";
import { STATUS_COLORS } from "@/constants/clients";
import { useRateSheets } from "@/hooks/rate-sheets/useRateSheets";
import {
  calculateProjectRevenue,
  resolveProjectRateSheet,
} from "@/lib/projectRate";
import { secsToHms } from "@/lib/time";

export function ProjectsTab({
  projects,
  loading,
}: {
  projects: Project[];
  loading: boolean;
}) {
  const intl = useIntl();
  const { rateSheets } = useRateSheets();

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        <FormattedMessage
          id="clients.projectsTab.noProjects"
          defaultMessage="No projects linked to this client."
        />
      </p>
    );
  }

  const revenueByProject = new Map(
    projects.map((p) => [
      p.id,
      calculateProjectRevenue(
        p,
        p.totalTimeSeconds ?? 0,
        resolveProjectRateSheet(rateSheets, p),
      ),
    ]),
  );
  const totalRevenue = projects.reduce(
    (sum, p) => sum + (revenueByProject.get(p.id) ?? 0),
    0,
  );
  const totalTimeSeconds = projects.reduce(
    (sum, p) => sum + (p.totalTimeSeconds ?? 0),
    0,
  );
  const totalWords = projects.reduce(
    (sum, p) => sum + (p.totalWordsProcessed ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              <FormattedMessage
                id="clients.projectsTab.projects"
                defaultMessage="Projects"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono">{projects.length}</p>
          </CardContent>
        </Card>
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
            <p className="text-2xl font-mono">{secsToHms(totalTimeSeconds)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              <FormattedMessage
                id="clients.projectsTab.totalWords"
                defaultMessage="Total words"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono">
              {intl.formatNumber(totalWords)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              <FormattedMessage
                id="clients.projectsTab.totalRevenue"
                defaultMessage="Total revenue"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono">
              {totalRevenue.toFixed(2)} {projects[0].currency}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="flex items-center justify-between py-3 px-2 -mx-2 gap-4 border-b border-border last:border-0 rounded hover:bg-accent/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm truncate">{p.title}</span>
                <Badge className={STATUS_COLORS[p.status] ?? ""}>
                  {p.status}
                </Badge>
                {p.activities?.map((a) => (
                  <Badge
                    key={a.id}
                    variant="outline"
                    className="text-xs shrink-0"
                  >
                    {a.name}
                  </Badge>
                ))}
                {p.deadline && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    <FormattedMessage
                      id="dashboard.upcomingDeadlines.due"
                      defaultMessage="Due {date}"
                      values={{ date: p.deadline.slice(0, 10) }}
                    />
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                ⏱ {secsToHms(p.totalTimeSeconds ?? 0)}
              </span>
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                {intl.formatMessage(
                  {
                    id: "time.entryRow.wordsCount",
                    defaultMessage: "{count} words",
                  },
                  { count: intl.formatNumber(p.totalWordsProcessed ?? 0) },
                )}
              </span>
              <span className="font-mono text-sm tabular-nums text-muted-foreground">
                {(revenueByProject.get(p.id) ?? 0).toFixed(2)}
              </span>
              <Badge variant="outline" className="text-xs font-mono">
                {p.currency}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

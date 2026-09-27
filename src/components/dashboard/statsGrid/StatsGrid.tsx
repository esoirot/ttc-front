import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatsGridProps as Props } from "@/types/dashboard.types";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function StatsGrid({ dashboard }: Props) {
  const intl = useIntl();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Link
        to="/projects"
        className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card className="h-full cursor-pointer hover:bg-accent/30 transition-colors">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              <FormattedMessage
                id="dashboard.statsGrid.activeProjects"
                defaultMessage="Active Projects"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {dashboard.activeProjectCount}
            </p>
          </CardContent>
        </Card>
      </Link>
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs text-muted-foreground font-normal">
            <FormattedMessage
              id="dashboard.statsGrid.hoursThisMonth"
              defaultMessage="Hours This Month"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold font-mono">
            {formatDuration(dashboard.monthToDateSeconds)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs text-muted-foreground font-normal">
            <FormattedMessage
              id="dashboard.statsGrid.revenueThisMonth"
              defaultMessage="Revenue This Month"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">
            {dashboard.monthToDateRevenue.toFixed(2)}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              EUR
            </span>
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs text-muted-foreground font-normal">
            <FormattedMessage
              id="dashboard.statsGrid.wordsThisYear"
              defaultMessage="Words This Year"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold font-mono">
            {intl.formatNumber(dashboard.yearToDateWords)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

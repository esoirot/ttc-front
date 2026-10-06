import { FormattedMessage, useIntl } from "react-intl";
import { KpiCard, KpiGrid } from "@/components/kpi/KpiCard";
import type { StatsGridProps as Props } from "@/types/dashboard.types";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function StatsGrid({ dashboard }: Props) {
  const intl = useIntl();
  return (
    <KpiGrid className="mb-6">
      <KpiCard
        to="/projects"
        label={
          <FormattedMessage
            id="dashboard.statsGrid.activeProjects"
            defaultMessage="Active Projects"
          />
        }
        value={dashboard.activeProjectCount}
      />
      <KpiCard
        mono
        label={
          <FormattedMessage
            id="dashboard.statsGrid.hoursThisMonth"
            defaultMessage="Hours This Month"
          />
        }
        value={formatDuration(dashboard.monthToDateSeconds)}
      />
      <KpiCard
        label={
          <FormattedMessage
            id="dashboard.statsGrid.revenueThisMonth"
            defaultMessage="Revenue This Month"
          />
        }
        value={dashboard.monthToDateRevenue.toFixed(2)}
        unit="EUR"
      />
      <KpiCard
        mono
        label={
          <FormattedMessage
            id="dashboard.statsGrid.wordsThisYear"
            defaultMessage="Words This Year"
          />
        }
        value={intl.formatNumber(dashboard.yearToDateWords)}
      />
    </KpiGrid>
  );
}

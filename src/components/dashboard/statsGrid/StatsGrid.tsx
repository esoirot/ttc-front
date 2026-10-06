import { FormattedMessage } from "react-intl";
import { CompactNumber } from "@/components/kpi/CompactNumber";
import { KpiCard, KpiGrid } from "@/components/kpi/KpiCard";
import type { StatsGridProps as Props } from "@/types/dashboard.types";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function StatsGrid({ dashboard }: Props) {
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
        value={<CompactNumber value={dashboard.activeProjectCount} />}
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
        value={
          <CompactNumber
            value={dashboard.monthToDateRevenue}
            fractionDigits={2}
          />
        }
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
        value={<CompactNumber value={dashboard.yearToDateWords} />}
      />
    </KpiGrid>
  );
}

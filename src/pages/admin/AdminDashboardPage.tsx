import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdminStats } from "../../hooks/admin/useAdminData";
import { useAdminInvoices } from "../../hooks/admin/useAdminData";
import { useAuditLog } from "../../hooks/integrations/useHubspot";
import { Badge } from "@/components/ui/badge";

function secsToH(s: number) {
  return (s / 3600).toFixed(1);
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | number;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-1 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-3xl font-semibold tabular-nums">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Derive simple time-series from invoices for the revenue chart
function buildRevenueChart(
  invoices: { createdAt: string; items: { total: number }[] }[],
) {
  const map = new Map<string, number>();
  invoices.forEach((inv) => {
    const day = inv.createdAt.slice(0, 10);
    const total = inv.items.reduce((s, i) => s + i.total, 0);
    map.set(day, (map.get(day) ?? 0) + total);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, revenue]) => ({ date: date.slice(5), revenue }));
}

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    CREATE: "default",
    UPDATE: "secondary",
    DELETE: "destructive",
  };

export function AdminDashboardPage() {
  const { stats, loading: statsLoading } = useAdminStats();
  const { invoices } = useAdminInvoices();
  const { data: auditData, isLoading: auditLoading } = useAuditLog(
    undefined,
    10,
  );
  const recentEntries =
    auditData?.pages.flatMap((p) => p.items).slice(0, 10) ?? [];

  const revenueChart = buildRevenueChart(invoices);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          label="Users"
          value={stats?.totalUsers ?? 0}
          loading={statsLoading}
        />
        <StatCard
          label="Clients"
          value={stats?.totalClients ?? 0}
          loading={statsLoading}
        />
        <StatCard
          label="Projects"
          value={stats?.totalProjects ?? 0}
          loading={statsLoading}
        />
        <StatCard
          label="Invoices"
          value={stats?.totalInvoices ?? 0}
          loading={statsLoading}
        />
        <StatCard
          label="Revenue"
          value={`€${(stats?.totalRevenue ?? 0).toFixed(0)}`}
          loading={statsLoading}
        />
        <StatCard
          label="Hours logged"
          value={`${secsToH(stats?.totalTimeSeconds ?? 0)}h`}
          loading={statsLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueChart.length === 0 ? (
              <div className="h-32 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">No data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart
                  data={revenueChart}
                  margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                >
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(v: number) => [`€${v.toFixed(2)}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#rev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {auditLoading ? (
              <div className="flex flex-col gap-1.5">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : recentEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No recent activity.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {recentEntries.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 text-xs">
                    <Badge
                      variant={ACTION_VARIANT[e.action] ?? "secondary"}
                      className="text-xs px-1.5 shrink-0"
                    >
                      {e.action}
                    </Badge>
                    <span className="text-muted-foreground font-mono shrink-0">
                      {e.resource}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {e.user.email}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

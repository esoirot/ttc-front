import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DistributionPieProps } from "@/types/projects.types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type LegendPayload,
} from "recharts";

const DISTRIBUTION_PIE_COLORS = [
  "#ea580c", // orange-600
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#9333ea", // purple-600
  "#db2777", // pink-600
  "#0891b2", // cyan-600
  "#ca8a04", // yellow-600
  "#dc2626", // red-600
  "#7c3aed", // violet-600
  "#0d9488", // teal-600
];

export function DistributionPie({
  title,
  subtitle,
  data,
  formatValue,
  emptyMessage,
}: DistributionPieProps) {
  const showEmptyMessage = data.length === 0 && emptyMessage;
  return (
    <Card className="sm:w-72 shrink-0">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="pb-4">
        {showEmptyMessage ? (
          <p className="text-sm text-muted-foreground h-[200px] flex items-center justify-center text-center">
            {emptyMessage}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      DISTRIBUTION_PIE_COLORS[
                        i % DISTRIBUTION_PIE_COLORS.length
                      ]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatValue(Number(value)), ""]}
                contentStyle={{
                  fontSize: "12px",
                  borderRadius: "6px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px" }}
                formatter={(value: string, entry: LegendPayload) => {
                  const label =
                    value.length > 18 ? value.slice(0, 16) + "…" : value;
                  const { value: v } = entry.payload as {
                    name: string;
                    value: number;
                  };
                  return `${label} — ${formatValue(v)}`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

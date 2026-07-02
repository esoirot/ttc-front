import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/lib/time";
import type { OverviewTabProps } from "@/types/projects.types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
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

export function OverviewTab({
  project,
  totalSeconds,
  tasks,
}: OverviewTabProps) {
  const tasksWithTime = tasks.filter((t) => (t.totalTimeSeconds ?? 0) > 0);
  const taskTotal = tasksWithTime.reduce(
    (sum, t) => sum + (t.totalTimeSeconds ?? 0),
    0,
  );
  const untracked = Math.max(0, totalSeconds - taskTotal);

  const pieData = [
    ...tasksWithTime.map((t) => ({
      name: t.title,
      value: t.totalTimeSeconds ?? 0,
    })),
    ...(untracked > 0 ? [{ name: "Untracked", value: untracked }] : []),
  ];

  const showPie = pieData.length > 0 && totalSeconds > 0;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="grid grid-cols-2 gap-4 flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Time logged</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono">{formatDuration(totalSeconds)}</p>
          </CardContent>
        </Card>
        {project.wordCount && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Word count</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">{project.wordCount.toLocaleString()}</p>
            </CardContent>
          </Card>
        )}
        {project.unitPrice && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Unit price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">
                {project.unitPrice} {project.currency}
              </p>
            </CardContent>
          </Card>
        )}
        {project.unitPrice && project.wordCount && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Est. revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">
                {(project.unitPrice * project.wordCount).toFixed(2)}{" "}
                {project.currency}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {showPie && (
        <Card className="sm:w-72 shrink-0">
          <CardHeader>
            <CardTitle className="text-sm">Time by task</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        i === pieData.length - 1 && untracked > 0
                          ? "#94a3b8"
                          : COLORS[i % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatDuration(Number(value)), ""]}
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
                  formatter={(value: string) =>
                    value.length > 18 ? value.slice(0, 16) + "…" : value
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

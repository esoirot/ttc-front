import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardDeadline } from "@/graphql/dashboard.operations";

const STATUS_BADGE: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  DRAFT: "secondary",
  ACTIVE: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
  ARCHIVED: "secondary",
};

interface Props {
  deadlines: DashboardDeadline[];
}

export function UpcomingDeadlines({ deadlines }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No deadlines in the next 7 days.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {deadlines.map((d: DashboardDeadline) => (
              <Link
                key={d.id}
                to={`/projects/${d.id}`}
                className="flex items-center justify-between py-1 hover:opacity-80 transition-opacity"
              >
                <div>
                  <p className="text-sm font-medium">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {d.deadline.slice(0, 10)}
                  </p>
                </div>
                <Badge
                  variant={STATUS_BADGE[d.status] ?? "secondary"}
                  className="text-xs"
                >
                  {d.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

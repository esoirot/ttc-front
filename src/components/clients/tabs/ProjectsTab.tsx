import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@/types/projects.types";
import { STATUS_COLORS } from "@/constants/clients";

export function ProjectsTab({
  projects,
  loading,
}: {
  projects: Project[];
  loading: boolean;
}) {
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
        No projects linked to this client.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {projects.map((p) => (
        <Card key={p.id}>
          <CardContent className="py-3 px-4 flex items-center justify-between">
            <span className="font-medium">{p.title}</span>
            <Badge className={STATUS_COLORS[p.status] ?? ""}>{p.status}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

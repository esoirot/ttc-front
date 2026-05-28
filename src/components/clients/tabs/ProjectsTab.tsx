import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@/types/projects.types";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-primary/15 text-primary",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-destructive/15 text-destructive",
  ARCHIVED: "bg-muted text-muted-foreground",
  INVOICE_SENT: "bg-amber-100 text-amber-700",
  INVOICE_PAID: "bg-emerald-100 text-emerald-700",
};

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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "../../hooks/projects/useProjects";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface OverviewTabProps {
  project: Project;
  totalSeconds: number;
}

export function OverviewTab({ project, totalSeconds }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
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
  );
}

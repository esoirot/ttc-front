import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ProjectCardProps } from "@/types/projects.types";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "secondary",
  ACTIVE: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
  ARCHIVED: "secondary",
  INVOICE_SENT: "outline",
  INVOICE_PAID: "outline",
};

export function ProjectCard({
  project,
  clientName,
  onDelete,
  onClick,
}: ProjectCardProps) {
  return (
    <Card
      className="cursor-pointer hover:bg-accent/30 transition-colors"
      onClick={onClick}
    >
      <CardContent className="py-3 px-4 flex items-center justify-between">
        <div>
          <p className="font-medium">{project.title}</p>
          <p className="text-muted-foreground text-xs">
            {project.clientId ? (clientName ?? "Client") : "No client"}
            {project.sourceLanguage && project.targetLanguage
              ? ` · ${project.sourceLanguage}→${project.targetLanguage}`
              : ""}
            {project.deadline ? ` · Due ${project.deadline.slice(0, 10)}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={
              (STATUS_COLORS[project.status] as
                | "default"
                | "secondary"
                | "outline"
                | "destructive") ?? "secondary"
            }
          >
            {project.status}
          </Badge>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive h-7 px-2"
                onClick={(e) => e.stopPropagation()}
              >
                ✕
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete project?</AlertDialogTitle>
                <AlertDialogDescription>
                  Delete <strong>{project.title}</strong>? This cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(project.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

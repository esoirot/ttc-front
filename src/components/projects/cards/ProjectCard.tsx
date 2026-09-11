import { FormattedMessage, useIntl } from "react-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { secsToHms } from "@/lib/time";
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
import { STATUS_VARIANTS, STATUS_BADGE_CLASSES } from "@/constants/projects";

export function ProjectCard({
  project,
  clientName,
  onDelete,
  onClick,
}: ProjectCardProps) {
  const intl = useIntl();
  return (
    <Card
      className="cursor-pointer hover:bg-accent/30 transition-colors"
      onClick={onClick}
    >
      <CardContent className="py-3 px-4 flex items-center justify-between">
        <div>
          <p className="font-medium">{project.title}</p>
          <p className="text-muted-foreground text-xs">
            {project.clientId
              ? (clientName ??
                intl.formatMessage({
                  id: "projects.card.client",
                  defaultMessage: "Client",
                }))
              : intl.formatMessage({
                  id: "projects.header.field.noClient",
                  defaultMessage: "No client",
                })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className="text-xs font-mono text-muted-foreground">
            ⏱ {secsToHms(project.totalTimeSeconds ?? 0)}
          </span>
          {project.sourceLanguage && project.targetLanguage && (
            <Badge variant="outline" className="text-xs font-mono">
              {project.sourceLanguage} → {project.targetLanguage}
            </Badge>
          )}
          {project.deadline && (
            <Badge variant="outline" className="text-xs">
              <FormattedMessage
                id="dashboard.upcomingDeadlines.due"
                defaultMessage="Due {date}"
                values={{ date: project.deadline.slice(0, 10) }}
              />
            </Badge>
          )}
          {project.wordCount != null ? (
            <Badge variant="outline" className="text-xs">
              <FormattedMessage
                id="projects.header.wordsProgress"
                defaultMessage="{processed} / {total} words"
                values={{
                  processed: intl.formatNumber(
                    project.totalWordsProcessed ?? 0,
                  ),
                  total: intl.formatNumber(project.wordCount),
                }}
              />
            </Badge>
          ) : (
            project.totalWordsProcessed != null &&
            project.totalWordsProcessed > 0 && (
              <Badge variant="outline" className="text-xs">
                <FormattedMessage
                  id="projects.header.wordsLogged"
                  defaultMessage="{total} words logged"
                  values={{
                    total: intl.formatNumber(project.totalWordsProcessed),
                  }}
                />
              </Badge>
            )
          )}
          <Badge
            variant={STATUS_VARIANTS[project.status] ?? "outline"}
            className={STATUS_BADGE_CLASSES[project.status]}
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
                <AlertDialogTitle>
                  <FormattedMessage
                    id="projects.card.deleteTitle"
                    defaultMessage="Delete project?"
                  />
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <FormattedMessage
                    id="projects.card.deleteDescription"
                    defaultMessage="Delete <b>{title}</b>? This cannot be undone."
                    values={{
                      title: project.title,
                      b: (chunks) => <strong>{chunks}</strong>,
                    }}
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <FormattedMessage
                    id="common.actions.cancel"
                    defaultMessage="Cancel"
                  />
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(project.id)}
                >
                  <FormattedMessage
                    id="common.actions.delete"
                    defaultMessage="Delete"
                  />
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

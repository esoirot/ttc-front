import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { Card, CardContent } from "@/components/ui/card";
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
import { OCCUPATION_TYPE_LABEL_MESSAGES } from "@/constants/occupations";
import type { OccupationCardProps } from "@/types/occupations.types";
import { Button } from "@/components/ui/button";

export function OccupationCard({
  occupation: a,
  onDelete,
}: OccupationCardProps) {
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <Card
      className="cursor-pointer hover:bg-accent/40 transition-colors"
      onClick={() => navigate(`/occupations/${a.id}`)}
    >
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-sm">{a.name}</span>
          {a.companyName && (
            <span className="text-xs text-muted-foreground">
              {a.companyName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-xs">
            {intl.formatMessage(
              OCCUPATION_TYPE_LABEL_MESSAGES[a.occupationType],
            )}
          </Badge>
          {a.legalForm && (
            <Badge variant="secondary" className="text-xs">
              {a.legalForm}
            </Badge>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => e.stopPropagation()}
                aria-label="Delete occupation"
              >
                ✕
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete occupation?</AlertDialogTitle>
                <AlertDialogDescription>
                  "{a.name}" and all its charges will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(a.id);
                  }}
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

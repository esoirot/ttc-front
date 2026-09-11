import { useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useSortableItem } from "@/hooks/projects/useSortableItem";
import type { Client } from "@/types/clients.types";

type ProspectCardProps = {
  client: Client;
  onDelete: (id: number) => void;
};

export function ProspectCard({ client, onDelete }: ProspectCardProps) {
  const intl = useIntl();
  const navigate = useNavigate();
  const { setNodeRef, style, attributes, listeners } = useSortableItem(
    client.id,
    0,
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-2 relative"
      data-testid={`prospect-card-${client.id}`}
    >
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1 h-5 w-5 p-0 z-10 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-sm"
            onClick={(e) => e.stopPropagation()}
            aria-label={intl.formatMessage({
              id: "clients.prospectCard.deleteAria",
              defaultMessage: "Delete prospect",
            })}
          >
            ✕
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <FormattedMessage
                id="clients.prospectCard.deleteTitle"
                defaultMessage="Delete prospect?"
              />
            </AlertDialogTitle>
            <AlertDialogDescription>
              <FormattedMessage
                id="clients.prospectCard.deleteDescription"
                defaultMessage="Delete <b>{name}</b>? This cannot be undone."
                values={{
                  name: client.name,
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
              onClick={() => onDelete(client.id)}
            >
              <FormattedMessage
                id="common.actions.delete"
                defaultMessage="Delete"
              />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card
        className="cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => navigate(`/clients/${client.id}`)}
      >
        <CardContent className="py-2 px-3 pr-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-grab h-6 px-1 text-muted-foreground hover:text-foreground shrink-0"
              {...attributes}
              {...listeners}
              aria-label={intl.formatMessage({
                id: "clients.prospectCard.dragAria",
                defaultMessage: "Drag to change status",
              })}
              tabIndex={0}
              onClick={(e) => e.stopPropagation()}
            >
              ⠿
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{client.name}</p>
              <p className="text-xs text-muted-foreground">
                {client.contactedAt
                  ? intl.formatDate(new Date(client.contactedAt))
                  : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

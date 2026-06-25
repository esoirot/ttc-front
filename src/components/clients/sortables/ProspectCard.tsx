import { useNavigate } from "react-router-dom";
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
            aria-label="Delete prospect"
          >
            ✕
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete prospect?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{client.name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete(client.id)}
            >
              Delete
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
              aria-label="Drag to change status"
              tabIndex={0}
              onClick={(e) => e.stopPropagation()}
            >
              ⠿
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{client.name}</p>
              <p className="text-xs text-muted-foreground">
                {client.contactedAt
                  ? new Date(client.contactedAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

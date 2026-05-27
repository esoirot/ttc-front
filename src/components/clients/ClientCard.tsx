import { useNavigate } from "react-router-dom";
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
import { INDUSTRY_LABELS } from "@/types/clients.types";
import type { ClientCardProps } from "@/types/clients.types";
import { contactLabel } from "@/hooks/clients/clientUtils";

export function ClientCard({ client, onDelete }: ClientCardProps) {
  const navigate = useNavigate();
  const label = contactLabel(client);
  return (
    <Card
      className="cursor-pointer hover:bg-accent/30 transition-colors"
      onClick={() => navigate(`/clients/${client.id}`)}
    >
      <CardContent className="py-3 px-4 flex items-center justify-between">
        <div>
          <p className="font-medium">{client.name}</p>
          {client.legalName && client.legalName !== client.name && (
            <p className="text-muted-foreground text-xs">{client.legalName}</p>
          )}
          {label && <p className="text-muted-foreground text-sm">{label}</p>}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {(client.city ?? client.country) && (
            <span className="text-xs">
              {[client.city, client.country].filter(Boolean).join(", ")}
            </span>
          )}
          <Badge
            variant={client.clientType === "COMPANY" ? "secondary" : "outline"}
            className="text-xs"
          >
            {client.clientType === "COMPANY" ? "Company" : "Individual"}
          </Badge>
          {client.industry && (
            <Badge variant="outline" className="text-xs">
              {INDUSTRY_LABELS[client.industry]}
            </Badge>
          )}
          {client.tags.slice(0, 2).map((t) => (
            <Badge key={t.id} variant="secondary" className="text-xs">
              {t.name}
            </Badge>
          ))}
          {client.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{client.tags.length - 2}
            </Badge>
          )}
          {client.contacts.length > 1 && (
            <Badge variant="secondary" className="text-xs">
              {client.contacts.length} contacts
            </Badge>
          )}
          {client.hubspotId && <Badge variant="secondary">HubSpot</Badge>}
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
                <AlertDialogTitle>Delete client?</AlertDialogTitle>
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
        </div>
      </CardContent>
    </Card>
  );
}

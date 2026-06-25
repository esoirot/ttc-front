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

const CLIENT_TYPE_CLASSES: Record<"COMPANY" | "INDIVIDUAL", string> = {
  COMPANY:
    "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
  INDIVIDUAL:
    "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30",
};

const INDUSTRY_CLASSES =
  "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30";

const TAG_CLASSES =
  "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:border-fuchsia-500/30";

const CONTACTS_CLASSES =
  "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30";

const HUBSPOT_CLASSES =
  "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30";

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
            variant="outline"
            className={`text-xs ${CLIENT_TYPE_CLASSES[client.clientType]}`}
          >
            {client.clientType === "COMPANY" ? "Company" : "Individual"}
          </Badge>
          {client.industry && (
            <Badge variant="outline" className={`text-xs ${INDUSTRY_CLASSES}`}>
              {INDUSTRY_LABELS[client.industry]}
            </Badge>
          )}
          {client.tags.slice(0, 2).map((t) => (
            <Badge
              key={t.id}
              variant="outline"
              className={`text-xs ${TAG_CLASSES}`}
            >
              {t.name}
            </Badge>
          ))}
          {client.tags.length > 2 && (
            <Badge variant="outline" className={`text-xs ${TAG_CLASSES}`}>
              +{client.tags.length - 2}
            </Badge>
          )}
          {client.contacts.length > 1 && (
            <Badge variant="outline" className={`text-xs ${CONTACTS_CLASSES}`}>
              {client.contacts.length} contacts
            </Badge>
          )}
          {client.hubspotId && (
            <Badge variant="outline" className={HUBSPOT_CLASSES}>
              HubSpot
            </Badge>
          )}
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

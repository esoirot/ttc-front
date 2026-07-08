import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_LABELS } from "@/constants/clients";
import type {
  DashboardProspect,
  ProspectsToContactProps as Props,
} from "@/types/dashboard.types";
import { formatTimeSinceContact } from "./formatTimeSinceContact";

export function ProspectsToContact({ prospects }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Prospects to contact</CardTitle>
      </CardHeader>
      <CardContent>
        {prospects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No prospects need follow-up right now.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {prospects.map((p: DashboardProspect) => (
              <Link
                key={p.id}
                to={`/clients/${p.id}`}
                className="flex items-center justify-between py-1 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeSinceContact(p.contactedAt)}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {STATUS_LABELS[p.status]}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

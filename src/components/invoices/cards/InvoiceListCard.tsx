import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InvoiceListCardProps as Props } from "@/types/invoices.types";
import { STATUS_BADGE } from "@/constants/invoices";

export function InvoiceListCard({ inv, clientName }: Props) {
  const intl = useIntl();
  const navigate = useNavigate();
  const total = inv.items.reduce((s, item) => s + item.total, 0);
  const clientLabel =
    clientName ??
    intl.formatMessage({
      id: "invoices.metaCard.noClient",
      defaultMessage: "No client",
    });
  const dueLabel = inv.dueDate
    ? " · " +
      intl.formatMessage(
        {
          id: "dashboard.upcomingDeadlines.due",
          defaultMessage: "Due {date}",
        },
        { date: inv.dueDate.slice(0, 10) },
      )
    : "";
  return (
    <Card
      className="cursor-pointer hover:bg-accent/30 transition-colors"
      onClick={() => navigate(`/invoices/${inv.id}`)}
    >
      <CardContent className="py-3 px-4 flex items-center justify-between">
        <div>
          <p className="font-medium font-mono">{inv.number}</p>
          <p className="text-xs text-muted-foreground">
            {clientLabel}
            {dueLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium">
            {total.toFixed(2)} {inv.currency}
          </span>
          <Badge variant={STATUS_BADGE[inv.status]}>{inv.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { Invoice } from "../../hooks/invoices/useInvoices";

const INVOICE_STATUS_COLORS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  DRAFT: "secondary",
  SENT: "default",
  PAID: "outline",
  OVERDUE: "destructive",
  CANCELLED: "secondary",
};

export function InvoiceRow({ inv }: { inv: Invoice }) {
  const navigate = useNavigate();
  const total = inv.items.reduce((s, i) => s + i.total, 0);
  return (
    <div
      className="flex items-center justify-between py-2 border-b border-border text-sm cursor-pointer hover:bg-accent/30 transition-colors px-1 rounded"
      onClick={() => navigate(`/invoices/${inv.id}`)}
    >
      <span className="font-mono text-xs text-muted-foreground">
        {inv.number}
      </span>
      <Badge
        variant={INVOICE_STATUS_COLORS[inv.status] ?? "secondary"}
        className="text-xs"
      >
        {inv.status}
      </Badge>
      <span className="font-mono">
        {total.toFixed(2)} {inv.currency}
      </span>
      <span className="text-muted-foreground text-xs">
        {inv.issuedAt ? inv.issuedAt.slice(0, 10) : inv.createdAt.slice(0, 10)}
      </span>
    </div>
  );
}

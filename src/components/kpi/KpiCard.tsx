import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KpiCardProps, KpiGridProps } from "@/types/shared-ui.types";

// Equal fixed-width columns: KPI cards stay compact and identical in size
// however wide the page is.
export function KpiGrid({ children, className }: KpiGridProps) {
  return (
    <div
      data-slot="kpi-grid"
      className={cn(
        "grid grid-cols-[repeat(auto-fill,14rem)] gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  unit,
  mono,
  to,
  children,
}: KpiCardProps) {
  const card = (
    <Card
      className={cn(
        "h-full",
        to && "cursor-pointer hover:bg-accent/30 transition-colors",
      )}
    >
      <CardHeader className="pb-1">
        <CardTitle className="text-xs text-muted-foreground font-normal">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {children ?? (
          <p className={cn("text-2xl font-semibold", mono && "font-mono")}>
            {value}
            {unit && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {unit}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return to ? (
    <Link
      to={to}
      className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {card}
    </Link>
  ) : (
    card
  );
}

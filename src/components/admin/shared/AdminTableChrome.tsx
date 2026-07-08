import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export function TableLoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function TableEmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="text-center text-muted-foreground py-8"
      >
        {children}
      </TableCell>
    </TableRow>
  );
}

export function LoadMoreButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" className="mt-4 w-full" onClick={onClick}>
      Load more
    </Button>
  );
}

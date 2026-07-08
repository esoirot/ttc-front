import { Button } from "@/components/ui/button";
import { exportCsv } from "@/lib/csv";

interface ExportCsvButtonProps<T extends Record<string, unknown>> {
  rows: T[];
  filename: string;
}

export function ExportCsvButton<T extends Record<string, unknown>>({
  rows,
  filename,
}: ExportCsvButtonProps<T>) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => exportCsv(rows, filename)}
    >
      Export CSV
    </Button>
  );
}

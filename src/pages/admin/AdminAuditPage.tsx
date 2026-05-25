import { AuditTable } from "../../components/account/AuditTable";
import { Button } from "@/components/ui/button";
import { useAuditLog } from "../../hooks/integrations/useHubspot";

function exportCsv<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = rows.map((r) =>
    headers.map((h) => JSON.stringify(r[h] ?? "")).join(","),
  );
  const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
    type: "text/csv",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function AdminAuditPage() {
  const { data } = useAuditLog();
  const entries = data?.pages.flatMap((p) => p.items) ?? [];

  function handleExport() {
    exportCsv(
      entries.map((e) => ({
        id: e.id,
        user: e.user.email,
        action: e.action,
        resource: e.resource,
        createdAt: e.createdAt,
      })),
      "audit-log.csv",
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold flex-1">Audit Log</h1>
        <Button variant="outline" size="sm" onClick={handleExport}>
          Export CSV
        </Button>
      </div>
      <AuditTable />
    </div>
  );
}

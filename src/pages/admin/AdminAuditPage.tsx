import { AuditTable } from "@/components/account/AuditTable";

export function AdminAuditPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">Audit Log</h1>
      <AuditTable />
    </div>
  );
}

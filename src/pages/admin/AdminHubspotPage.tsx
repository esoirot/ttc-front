import { ConnectionsTable } from "../../components/account/ConnectionsTable";

export function AdminHubspotPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">HubSpot Connections</h1>
      <ConnectionsTable />
    </div>
  );
}

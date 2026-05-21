import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditTable } from "@/components/account/AuditTable";
import { ConnectionsTable } from "@/components/account/ConnectionsTable";
import { UsersTable } from "@/components/account/UsersTable";

export function AuditLogPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">Admin</h1>
      <Tabs defaultValue="audit">
        <TabsList>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
          <TabsTrigger value="connections">HubSpot connections</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="audit">
          <AuditTable />
        </TabsContent>
        <TabsContent value="connections">
          <ConnectionsTable />
        </TabsContent>
        <TabsContent value="users">
          <UsersTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

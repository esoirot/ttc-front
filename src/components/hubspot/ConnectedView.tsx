import { useDisconnectHubspot } from "../../hooks/integrations/useHubspot";
import { ContactsTab } from "./ContactsTab";
import { CompaniesTab } from "./CompaniesTab";
import { DealsTab } from "./DealsTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ConnectedView({ portalId }: { portalId: string | null }) {
  const disconnect = useDisconnectHubspot();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">HubSpot connected</span>
          {portalId && (
            <span className="text-xs text-muted-foreground">
              Portal {portalId}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => void disconnect.mutateAsync()}
          disabled={disconnect.isPending}
        >
          {disconnect.isPending ? "Disconnecting…" : "Disconnect"}
        </Button>
      </div>

      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
        </TabsList>
        <TabsContent value="contacts" className="mt-4">
          <ContactsTab />
        </TabsContent>
        <TabsContent value="companies" className="mt-4">
          <CompaniesTab />
        </TabsContent>
        <TabsContent value="deals" className="mt-4">
          <DealsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

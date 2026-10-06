import { useParams } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useClientDetail } from "@/hooks/clients/useClientDetail";
import { useClientRates } from "@/hooks/clients/useClientRates";
import { useRateSheets } from "@/hooks/rate-sheets/useRateSheets";
import { ContactsTab } from "./tabs/ContactsTab";
import { ProjectsTab } from "./tabs/ProjectsTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { ClientRatesTab } from "./tabs/ClientRatesTab";
import { ClientHeader } from "./headers/ClientHeader";

export function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const clientId = Number(id);
  const {
    client,
    clientLoading,
    clientProjects,
    clientProjectIds,
    projectsLoading,
    invoices,
    invoicesLoading,
    totalSeconds,
    timeLoading,
    statusHistory,
    updateClient,
    updatingClient,
    createContact,
    creatingContact,
    updateContact,
    updatingContact,
    deleteContact,
  } = useClientDetail(clientId);
  const { clientRates } = useClientRates(clientId);
  const { rateSheets } = useRateSheets();
  const clientRateSheets = rateSheets.filter((s) => s.clientId === clientId);
  const ratesCount = clientRates.length + clientRateSheets.length;

  if (clientLoading) {
    return (
      <div className="w-full px-8 py-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="w-full px-8 py-8">
        <p className="text-muted-foreground">
          <FormattedMessage
            id="clients.detail.notFound"
            defaultMessage="Client not found."
          />
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-8 py-8">
      <ClientHeader
        client={client}
        onUpdate={updateClient}
        saving={updatingClient}
      />

      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">
            <FormattedMessage
              id="clients.detail.tabs.contacts"
              defaultMessage="Contacts"
            />
            {client.contacts.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {client.contacts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="projects">
            <FormattedMessage
              id="clients.projectsTab.projects"
              defaultMessage="Projects"
            />
            {clientProjects.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {clientProjects.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity">
            <FormattedMessage
              id="activities.detail.activity"
              defaultMessage="Activity"
            />
            {invoices.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {invoices.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rates">
            <FormattedMessage
              id="activities.detail.rates"
              defaultMessage="Rates"
            />
            {ratesCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {ratesCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="mt-4">
          <ContactsTab
            contacts={client.contacts}
            onDelete={(id) => void deleteContact(id)}
            onEdit={(input) => updateContact(input)}
            onAdd={(input) => createContact(input)}
            saving={updatingContact}
            adding={creatingContact}
          />
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <ProjectsTab projects={clientProjects} loading={projectsLoading} />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <ActivityTab
            invoices={invoices}
            invoicesLoading={invoicesLoading}
            totalSeconds={totalSeconds}
            timeLoading={timeLoading}
            hasProjects={clientProjectIds.length > 0}
            statusHistory={statusHistory}
          />
        </TabsContent>

        <TabsContent value="rates" className="mt-4">
          <ClientRatesTab clientId={clientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

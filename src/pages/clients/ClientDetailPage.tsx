import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useClientDetail } from "../../hooks/clients/useClientDetail";
import { ClientHeader } from "../../components/clients/ClientHeader";
import { ContactsTab } from "../../components/clients/ContactsTab";
import { ProjectsTab } from "../../components/clients/ProjectsTab";
import { ActivityTab } from "../../components/clients/ActivityTab";

export function ClientDetailPage() {
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
    updateClient,
    updatingClient,
    createContact,
    creatingContact,
    updateContact,
    updatingContact,
    deleteContact,
  } = useClientDetail(clientId);

  if (clientLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-muted-foreground">Client not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <ClientHeader
        client={client}
        onUpdate={updateClient}
        saving={updatingClient}
      />

      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">
            Contacts
            {client.contacts.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {client.contacts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
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
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import {
  useClient,
  useCreateCompanyContact,
  useUpdateCompanyContact,
  useDeleteCompanyContact,
  useUpdateClient,
} from "./useClients";
import { useProjects } from "../projects/useProjects";
import { useInvoices } from "../invoices/useInvoices";
import { useTimeEntries } from "../time/useTimeEntries";

export function useClientDetail(clientId: number) {
  const { client, loading: clientLoading } = useClient(clientId);
  const { projects, loading: projectsLoading } = useProjects();
  const clientProjects = projects.filter((p) => p.clientId === clientId);
  const clientProjectIds = clientProjects.map((p) => p.id);
  const { invoices, loading: invoicesLoading } = useInvoices(
    undefined,
    clientId,
  );
  const { entries: timeEntries, loading: timeLoading } = useTimeEntries(
    clientProjectIds.length > 0 ? { projectIds: clientProjectIds } : undefined,
  );
  const totalSeconds = timeEntries.reduce(
    (sum, e) => sum + (e.durationSeconds ?? 0),
    0,
  );
  const { updateClient, loading: updatingClient } = useUpdateClient();
  const { createContact, loading: creatingContact } =
    useCreateCompanyContact(clientId);
  const { updateContact, loading: updatingContact } =
    useUpdateCompanyContact(clientId);
  const { deleteContact } = useDeleteCompanyContact(clientId);

  return {
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
  };
}

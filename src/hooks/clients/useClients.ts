import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  CLIENTS_QUERY,
  CLIENT_QUERY,
  CREATE_CLIENT_MUTATION,
  UPDATE_CLIENT_MUTATION,
  DELETE_CLIENT_MUTATION,
  CREATE_COMPANY_CONTACT_MUTATION,
  UPDATE_COMPANY_CONTACT_MUTATION,
  DELETE_COMPANY_CONTACT_MUTATION,
} from "../../graphql/clients.operations";
import type {
  Client,
  ClientConnection,
  ClientType,
  ClientStatus,
  ClientIndustry,
  ContactInput,
  ClientInput,
} from "@/types/clients.types";
import { gqlMutate } from "@/lib/apollo";
import { useGqlQuery, useGqlConnectionQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import { removeFromConnection, patchNestedField } from "@/lib/cachePatch";

const LIMIT = 20;

export function useClients({
  search,
  clientType,
  excludeStatus,
  status,
  industry,
  limit = LIMIT,
}: {
  search?: string;
  clientType?: ClientType;
  excludeStatus?: ClientStatus;
  status?: ClientStatus;
  industry?: ClientIndustry;
  limit?: number;
} = {}) {
  const baseVars = {
    ...(search ? { search } : {}),
    ...(clientType ? { clientType } : {}),
    ...(excludeStatus ? { excludeStatus } : {}),
    ...(status ? { status } : {}),
    ...(industry ? { industry } : {}),
  };

  const { items, total, hasMore, loadMore, loading, error } =
    useGqlConnectionQuery({
      queryKey: [
        "clients",
        {
          search: search ?? null,
          clientType: clientType ?? null,
          excludeStatus: excludeStatus ?? null,
          status: status ?? null,
          industry: industry ?? null,
        },
      ],
      query: CLIENTS_QUERY,
      variables: baseVars,
      select: (d) => d.clients,
      limit,
    });

  return { clients: items, total, hasMore, loadMore, loading, error };
}

// Dropdowns and id→name lookups need every client, not the first list page;
// otherwise a saved client outside page 1 renders as an empty Select.
const ALL_LIMIT = 1000;

export function useAllClients() {
  const { items, loading } = useGqlConnectionQuery({
    queryKey: ["clients", { all: true }],
    query: CLIENTS_QUERY,
    variables: {},
    select: (d) => d.clients,
    limit: ALL_LIMIT,
  });
  return { clients: items, loading };
}

/** First clients matching `search` for a picker; searched on the server. */
export function useClientOptions(search: string, enabled: boolean) {
  const { items, loading } = useGqlConnectionQuery({
    queryKey: ["clients", { options: true, search }],
    query: CLIENTS_QUERY,
    variables: search ? { search } : {},
    select: (d) => d.clients,
    limit: LIMIT,
    enabled,
  });
  return { clients: items, loading };
}

export function useClient(id: number) {
  const { data, isLoading, error } = useGqlQuery({
    queryKey: ["client", id],
    query: CLIENT_QUERY,
    variables: { id },
    select: (d) => d.client,
    enabled: !!id,
  });
  return { client: data ?? null, loading: isLoading, error };
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: CREATE_CLIENT_MUTATION,
    unwrap: (d) => d.createClient,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
  return {
    createClient: (input: ClientInput) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: Partial<ClientInput> & { id: number }) =>
      gqlMutate<{ updateClient: Client }>(UPDATE_CLIENT_MUTATION, {
        input,
      }).then((d) => d.updateClient),
    onSuccess: (updated) => {
      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["clients"] })
        .forEach((query) => {
          const key = query.queryKey[1] as
            | {
                excludeStatus?: ClientStatus | null;
                status?: ClientStatus | null;
                industry?: ClientIndustry | null;
              }
            | undefined;
          const stillMatches =
            (!key?.excludeStatus || updated.status !== key.excludeStatus) &&
            (!key?.status || updated.status === key.status) &&
            (!key?.industry || updated.industry === key.industry);
          queryClient.setQueryData<InfiniteData<ClientConnection>>(
            query.queryKey,
            (old) =>
              old
                ? {
                    ...old,
                    pages: old.pages.map((page) =>
                      stillMatches
                        ? {
                            ...page,
                            items: page.items.map((c) =>
                              c.id === updated.id ? updated : c,
                            ),
                          }
                        : {
                            ...page,
                            items: page.items.filter(
                              (c) => c.id !== updated.id,
                            ),
                          },
                    ),
                  }
                : old,
          );
        });
      queryClient.setQueryData(["client", updated.id], updated);
    },
  });
  return {
    updateClient: (input: Partial<ClientInput> & { id: number }) =>
      mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: DELETE_CLIENT_MUTATION,
    unwrap: (d) => d.deleteClient,
    onSuccess: (_data, { id }) => {
      removeFromConnection(queryClient, ["clients"], id, (c: Client) => c.id);
      queryClient.removeQueries({ queryKey: ["client", id] });
    },
  });
  return {
    deleteClient: (id: number) => mutateAsync({ id }),
    loading: isPending,
    error,
  };
}

type Contact = Client["contacts"][number];

export function useCreateCompanyContact(clientId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: CREATE_COMPANY_CONTACT_MUTATION,
    unwrap: (d) => d.createCompanyContact,
    onSuccess: (newContact) => {
      patchNestedField<Client, Contact>(
        queryClient,
        ["client", clientId],
        "contacts",
        newContact,
        (c) => c.id,
        "add",
      );
    },
  });
  return {
    createContact: (input: Omit<ContactInput, "clientId">) =>
      mutateAsync({ input: { ...input, clientId } }),
    loading: isPending,
    error,
  };
}

export function useUpdateCompanyContact(clientId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: UPDATE_COMPANY_CONTACT_MUTATION,
    unwrap: (d) => d.updateCompanyContact,
    onSuccess: (updated) => {
      patchNestedField<Client, Contact>(
        queryClient,
        ["client", clientId],
        "contacts",
        updated,
        (c) => c.id,
        "upsert",
      );
    },
  });
  return {
    updateContact: (
      input: Partial<Omit<ContactInput, "clientId">> & { id: number },
    ) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useDeleteCompanyContact(clientId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, error } = useGqlMutation({
    mutation: DELETE_COMPANY_CONTACT_MUTATION,
    unwrap: (d) => d.deleteCompanyContact,
    onSuccess: (_data, { id }) => {
      queryClient.setQueryData<Client>(["client", clientId], (old) =>
        old
          ? { ...old, contacts: old.contacts.filter((c) => c.id !== id) }
          : old,
      );
    },
  });
  return {
    deleteContact: (id: number) => mutateAsync({ id }),
    error,
  };
}

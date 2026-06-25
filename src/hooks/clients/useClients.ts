import {
  useQuery,
  useInfiniteQuery,
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
  ContactInput,
  ClientInput,
} from "@/types/clients.types";
import { gqlFetch, gqlMutate } from "@/lib/apollo";

const LIMIT = 20;

export function useClients(
  search?: string,
  clientType?: ClientType,
  excludeStatus?: ClientStatus,
  status?: ClientStatus,
  limit: number = LIMIT,
) {
  const baseVars = {
    ...(search ? { search } : {}),
    ...(clientType ? { clientType } : {}),
    ...(excludeStatus ? { excludeStatus } : {}),
    ...(status ? { status } : {}),
  };

  const { data, fetchNextPage, hasNextPage, isLoading, error } =
    useInfiniteQuery<ClientConnection>({
      queryKey: [
        "clients",
        {
          search: search ?? null,
          clientType: clientType ?? null,
          excludeStatus: excludeStatus ?? null,
          status: status ?? null,
        },
      ],
      queryFn: ({ pageParam }) =>
        gqlFetch<{ clients: ClientConnection }>(CLIENTS_QUERY, {
          ...baseVars,
          pagination: {
            limit,
            ...(pageParam != null ? { cursor: pageParam as number } : {}),
          },
        }).then((d) => d.clients),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  return {
    clients: data?.pages.flatMap((p) => p.items) ?? [],
    total: data?.pages[0]?.total ?? 0,
    hasMore: !!hasNextPage,
    loadMore: () => void fetchNextPage(),
    loading: isLoading,
    error,
  };
}

export function useClient(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["client", id],
    queryFn: () =>
      gqlFetch<{ client: Client }>(CLIENT_QUERY, { id }).then((d) => d.client),
    enabled: !!id,
  });
  return { client: data ?? null, loading: isLoading, error };
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: ClientInput) =>
      gqlMutate<{ createClient: Client }>(CREATE_CLIENT_MUTATION, {
        input,
      }).then((d) => d.createClient),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
  return {
    createClient: (input: ClientInput) => mutateAsync(input),
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
              }
            | undefined;
          const stillMatches =
            (!key?.excludeStatus || updated.status !== key.excludeStatus) &&
            (!key?.status || updated.status === key.status);
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
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ deleteClient: boolean }>(DELETE_CLIENT_MUTATION, {
        id,
      }).then((d) => d.deleteClient),
    onSuccess: (_data, id) => {
      queryClient.setQueriesData<InfiniteData<ClientConnection>>(
        { queryKey: ["clients"] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((c) => c.id !== id),
                  total: page.total - 1,
                })),
              }
            : old,
      );
      queryClient.removeQueries({ queryKey: ["client", id] });
    },
  });
  return {
    deleteClient: (id: number) => mutateAsync(id),
    loading: isPending,
    error,
  };
}

export function useCreateCompanyContact(clientId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: Omit<ContactInput, "clientId">) =>
      gqlMutate<{ createCompanyContact: Client["contacts"][number] }>(
        CREATE_COMPANY_CONTACT_MUTATION,
        { input: { ...input, clientId } },
      ).then((d) => d.createCompanyContact),
    onSuccess: (newContact) => {
      queryClient.setQueryData<Client>(["client", clientId], (old) =>
        old ? { ...old, contacts: [...old.contacts, newContact] } : old,
      );
    },
  });
  return {
    createContact: (input: Omit<ContactInput, "clientId">) =>
      mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useUpdateCompanyContact(clientId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (
      input: Partial<Omit<ContactInput, "clientId">> & { id: number },
    ) =>
      gqlMutate<{ updateCompanyContact: Client["contacts"][number] }>(
        UPDATE_COMPANY_CONTACT_MUTATION,
        { input },
      ).then((d) => d.updateCompanyContact),
    onSuccess: (updated) => {
      queryClient.setQueryData<Client>(["client", clientId], (old) =>
        old
          ? {
              ...old,
              contacts: old.contacts.map((c) =>
                c.id === updated.id ? updated : c,
              ),
            }
          : old,
      );
    },
  });
  return {
    updateContact: (
      input: Partial<Omit<ContactInput, "clientId">> & { id: number },
    ) => mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useDeleteCompanyContact(clientId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, error } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ deleteCompanyContact: boolean }>(
        DELETE_COMPANY_CONTACT_MUTATION,
        { id },
      ).then((d) => d.deleteCompanyContact),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Client>(["client", clientId], (old) =>
        old
          ? { ...old, contacts: old.contacts.filter((c) => c.id !== id) }
          : old,
      );
    },
  });
  return {
    deleteContact: (id: number) => mutateAsync(id),
    error,
  };
}

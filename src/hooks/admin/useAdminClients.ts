import { useQueryClient } from "@tanstack/react-query";
import {
  ADMIN_CLIENTS_QUERY,
  ADMIN_CREATE_CLIENT_MUTATION,
  ADMIN_UPDATE_CLIENT_MUTATION,
  ADMIN_DELETE_CLIENT_MUTATION,
} from "../../graphql/admin.operations";
import type { AdminClient } from "@/types/admin.types";
import { useGqlConnectionQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import { patchConnection, removeFromConnection } from "@/lib/cachePatch";

const LIMIT = 20;

export function useAdminClients(search?: string) {
  const { items, total, hasMore, loadMore, loading, refetch } =
    useGqlConnectionQuery({
      queryKey: ["adminClients", { search: search ?? null }],
      query: ADMIN_CLIENTS_QUERY,
      variables: { search },
      select: (d) => d.adminClients,
      limit: LIMIT,
    });

  return {
    clients: items,
    loading,
    total,
    hasMore,
    loadMore,
    refetch,
  };
}

export function useAdminCrudClients() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["adminClients"] });

  const { mutateAsync: create } = useGqlMutation({
    mutation: ADMIN_CREATE_CLIENT_MUTATION,
    unwrap: (d) => d.adminCreateClient,
    onSuccess: invalidate,
  });

  const { mutateAsync: update } = useGqlMutation({
    mutation: ADMIN_UPDATE_CLIENT_MUTATION,
    unwrap: (d) => d.adminUpdateClient,
    onSuccess: (updated) => {
      patchConnection(queryClient, ["adminClients"], updated, (c) => c.id);
    },
  });

  const { mutateAsync: remove } = useGqlMutation({
    mutation: ADMIN_DELETE_CLIENT_MUTATION,
    unwrap: (d) => d.adminDeleteClient,
    onSuccess: (_data, { id }) => {
      removeFromConnection(
        queryClient,
        ["adminClients"],
        id,
        (c: AdminClient) => c.id,
      );
    },
  });

  return {
    createClient: (input: {
      userId: number;
      name: string;
      email?: string;
      phone?: string;
      city?: string;
      country?: string;
    }) => create({ input }),
    updateClient: (input: {
      id: number;
      name?: string;
      email?: string;
      phone?: string;
      legalName?: string;
      city?: string;
      country?: string;
      postalCode?: string;
      vatNumber?: string;
      address?: string;
    }) => update({ input }),
    deleteClient: (id: number) => remove({ id }),
  };
}

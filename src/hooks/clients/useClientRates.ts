import { useQuery, useMutation } from "@apollo/client/react";
import type { ClientRate } from "@/types/client-rates.types";
import {
  CLIENT_RATES_QUERY,
  CREATE_CLIENT_RATE_MUTATION,
  UPDATE_CLIENT_RATE_MUTATION,
  DELETE_CLIENT_RATE_MUTATION,
} from "@/graphql/client-rates.operations";

export function useClientRates(clientId: number | null) {
  const { data, loading } = useQuery(CLIENT_RATES_QUERY, {
    variables: { clientId: clientId ?? 0 },
    skip: clientId == null,
  });
  return { clientRates: data?.clientRates ?? [], loading };
}

export function useCreateClientRate(clientId: number) {
  const [mutate, { loading }] = useMutation(CREATE_CLIENT_RATE_MUTATION, {
    refetchQueries: [{ query: CLIENT_RATES_QUERY, variables: { clientId } }],
  });

  async function createClientRate(
    input: Omit<
      ClientRate,
      "id" | "clientId" | "userId" | "createdAt" | "updatedAt"
    >,
  ) {
    return mutate({
      variables: {
        input: {
          ...input,
          clientId,
          description: input.description ?? undefined,
        },
      },
    });
  }

  return { createClientRate, loading };
}

export function useUpdateClientRate(clientId: number) {
  const [mutate, { loading }] = useMutation(UPDATE_CLIENT_RATE_MUTATION, {
    refetchQueries: [{ query: CLIENT_RATES_QUERY, variables: { clientId } }],
  });

  async function updateClientRate(
    input: Partial<
      Omit<ClientRate, "clientId" | "userId" | "createdAt" | "updatedAt">
    > & { id: number },
  ) {
    return mutate({
      variables: {
        input: { ...input, description: input.description ?? undefined },
      },
    });
  }

  return { updateClientRate, loading };
}

export function useDeleteClientRate(clientId: number) {
  const [mutate] = useMutation(DELETE_CLIENT_RATE_MUTATION, {
    refetchQueries: [{ query: CLIENT_RATES_QUERY, variables: { clientId } }],
  });

  async function deleteClientRate(id: number) {
    return mutate({ variables: { id } });
  }

  return { deleteClientRate };
}

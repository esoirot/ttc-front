import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ClientRate } from "@/types/client-rates.types";
import {
  CLIENT_RATES_QUERY,
  CREATE_CLIENT_RATE_MUTATION,
  UPDATE_CLIENT_RATE_MUTATION,
  DELETE_CLIENT_RATE_MUTATION,
} from "@/graphql/client-rates.operations";
import { gqlMutate } from "@/lib/apollo";
import { useGqlQuery } from "@/lib/gqlQuery";
import type { CreateClientRateInput } from "@/types/clients.types";

export function useClientRates(clientId: number | null) {
  const { data, isLoading } = useGqlQuery({
    queryKey: ["clientRates", clientId],
    query: CLIENT_RATES_QUERY,
    variables: { clientId: clientId! },
    select: (d) => d.clientRates,
    enabled: clientId != null,
  });
  return { clientRates: data ?? [], loading: isLoading };
}

export function useCreateClientRate(clientId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: CreateClientRateInput) =>
      gqlMutate<{ createClientRate: ClientRate }>(CREATE_CLIENT_RATE_MUTATION, {
        input: {
          ...input,
          clientId,
          description: input.description ?? undefined,
        },
      }).then((d) => d.createClientRate),
    onSuccess: (created) => {
      queryClient.setQueryData<ClientRate[]>(
        ["clientRates", clientId],
        (old) => [...(old ?? []), created],
      );
    },
  });
  return {
    createClientRate: (input: CreateClientRateInput) => mutateAsync(input),
    loading: isPending,
  };
}

type UpdateClientRateInput = Partial<
  Omit<ClientRate, "clientId" | "userId" | "createdAt" | "updatedAt">
> & { id: number };

export function useUpdateClientRate(clientId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: UpdateClientRateInput) =>
      gqlMutate<{ updateClientRate: ClientRate }>(UPDATE_CLIENT_RATE_MUTATION, {
        input: { ...input, description: input.description ?? undefined },
      }).then((d) => d.updateClientRate),
    onSuccess: (updated) => {
      queryClient.setQueryData<ClientRate[]>(
        ["clientRates", clientId],
        (old) => old?.map((r) => (r.id === updated.id ? updated : r)) ?? [],
      );
    },
  });
  return {
    updateClientRate: (input: UpdateClientRateInput) => mutateAsync(input),
    loading: isPending,
  };
}

export function useDeleteClientRate(clientId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ deleteClientRate: boolean }>(DELETE_CLIENT_RATE_MUTATION, {
        id,
      }).then((d) => d.deleteClientRate),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<ClientRate[]>(
        ["clientRates", clientId],
        (old) => old?.filter((r) => r.id !== id) ?? [],
      );
    },
  });
  return { deleteClientRate: (id: number) => mutateAsync(id) };
}

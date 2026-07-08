import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TranslationRateType } from "@/types/rates.types";
import {
  ADMIN_RATES_QUERY,
  ADMIN_CREATE_RATE_MUTATION,
  ADMIN_UPDATE_RATE_MUTATION,
  ADMIN_DELETE_RATE_MUTATION,
} from "../../graphql/admin.operations";
import type { AdminRate, AdminConnection } from "@/types/admin.types";
import { gqlFetch, gqlMutate } from "@/lib/apollo";
import { useGqlMutation } from "@/lib/gqlMutation";

export function useAdminRates(type?: TranslationRateType) {
  const { data, isLoading } = useQuery({
    queryKey: ["adminRates", { type: type ?? null }],
    queryFn: () =>
      gqlFetch<{ adminRates: AdminConnection<AdminRate> }>(ADMIN_RATES_QUERY, {
        type,
      }).then((d) => d.adminRates),
  });
  const conn = data;
  return {
    rates: conn?.items ?? [],
    loading: isLoading,
    total: conn?.total ?? 0,
  };
}

export function useAdminCrudRates() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["adminRates"] });

  const { mutateAsync: create } = useGqlMutation({
    mutation: ADMIN_CREATE_RATE_MUTATION,
    unwrap: (d) => d.adminCreateRate,
    onSuccess: invalidate,
  });

  const { mutateAsync: update } = useMutation({
    mutationFn: (input: {
      id: number;
      name?: string;
      amount?: number;
      currency?: string;
      description?: string;
      activityId?: number | null;
    }) =>
      gqlMutate<{ adminUpdateRate: AdminRate }>(ADMIN_UPDATE_RATE_MUTATION, {
        input,
      }).then((d) => d.adminUpdateRate),
    onSuccess: (updated) => {
      queryClient.setQueriesData<AdminConnection<AdminRate>>(
        { queryKey: ["adminRates"] },
        (old) =>
          old
            ? {
                ...old,
                items: old.items.map((r) =>
                  r.id === updated.id ? updated : r,
                ),
              }
            : old,
      );
    },
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ adminDeleteRate: { id: number } }>(
        ADMIN_DELETE_RATE_MUTATION,
        {
          id,
        },
      ).then((d) => d.adminDeleteRate),
    onSuccess: (_data, id) => {
      queryClient.setQueriesData<AdminConnection<AdminRate>>(
        { queryKey: ["adminRates"] },
        (old) =>
          old
            ? {
                ...old,
                items: old.items.filter((r) => r.id !== id),
                total: old.total - 1,
              }
            : old,
      );
    },
  });

  return {
    createRate: (input: {
      userId: number;
      type: TranslationRateType;
      name: string;
      amount: number;
      currency: string;
      description?: string;
      activityId?: number | null;
    }) => create({ input }),
    updateRate: (input: Parameters<typeof update>[0]) => update(input),
    deleteRate: (id: number) => remove(id),
  };
}

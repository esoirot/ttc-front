import { useQueryClient } from "@tanstack/react-query";
import {
  TRANSLATION_RATES_QUERY,
  CREATE_TRANSLATION_RATE_MUTATION,
  UPDATE_TRANSLATION_RATE_MUTATION,
  DELETE_TRANSLATION_RATE_MUTATION,
  type TranslationRateType,
  type TranslationRate,
} from "../../graphql/rates.operations";
import { useGqlQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import {
  appendToFlatArray,
  patchFlatArray,
  removeFromFlatArray,
} from "@/lib/cachePatch";
import type { CreateRateInput, UpdateRateInput } from "@/types/rates.types";

export type { TranslationRateType, TranslationRate };

export function useRates(type?: TranslationRateType) {
  const { data, isLoading } = useGqlQuery({
    queryKey: ["translationRates", type ?? null],
    query: TRANSLATION_RATES_QUERY,
    variables: type ? { type } : {},
    select: (d) => d.translationRates ?? [],
  });
  return { rates: data ?? [], loading: isLoading };
}

export function useCreateRate(activityId?: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: CREATE_TRANSLATION_RATE_MUTATION,
    unwrap: (d) => d.createTranslationRate,
    onSuccess: (created) => {
      appendToFlatArray(queryClient, ["translationRates", null], created);
      appendToFlatArray(
        queryClient,
        ["translationRates", created.type],
        created,
      );
      if (activityId != null) {
        void queryClient.invalidateQueries({
          queryKey: ["activity", activityId],
        });
      }
    },
  });
  return {
    createRate: (input: CreateRateInput) => mutateAsync({ input }),
    loading: isPending,
  };
}

export function useUpdateRate() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: UPDATE_TRANSLATION_RATE_MUTATION,
    unwrap: (d) => d.updateTranslationRate,
    onSuccess: (updated) => {
      patchFlatArray(
        queryClient,
        ["translationRates", null],
        updated,
        (r) => r.id,
      );
      patchFlatArray(
        queryClient,
        ["translationRates", updated.type],
        updated,
        (r) => r.id,
      );
    },
  });
  return {
    updateRate: (input: UpdateRateInput) => mutateAsync({ input }),
    loading: isPending,
  };
}

export function useDeleteRate(activityId?: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useGqlMutation({
    mutation: DELETE_TRANSLATION_RATE_MUTATION,
    unwrap: (d) => d.deleteTranslationRate,
    onSuccess: (_data, { id }) => {
      removeFromFlatArray(
        queryClient,
        ["translationRates", null],
        id,
        (r: TranslationRate) => r.id,
      );
      for (const type of [
        "HOURLY",
        "PER_WORD",
        "FIXED",
      ] as TranslationRateType[]) {
        removeFromFlatArray(
          queryClient,
          ["translationRates", type],
          id,
          (r: TranslationRate) => r.id,
        );
      }
      if (activityId != null) {
        void queryClient.invalidateQueries({
          queryKey: ["activity", activityId],
        });
      }
    },
  });
  return { deleteRate: (id: number) => mutateAsync({ id }) };
}

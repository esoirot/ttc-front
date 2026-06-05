import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TRANSLATION_RATES_QUERY,
  CREATE_TRANSLATION_RATE_MUTATION,
  UPDATE_TRANSLATION_RATE_MUTATION,
  DELETE_TRANSLATION_RATE_MUTATION,
  type TranslationRateType,
  type TranslationRate,
} from "../../graphql/rates.operations";
import { gqlRequest } from "@/lib/api";

export type { TranslationRateType, TranslationRate };

export function useRates(type?: TranslationRateType) {
  const { data, isLoading } = useQuery({
    queryKey: ["translationRates", type ?? null],
    queryFn: () =>
      gqlRequest<{ translationRates: TranslationRate[] }>(
        TRANSLATION_RATES_QUERY,
        type ? { type } : {},
      ).then((d) => d.translationRates),
  });
  return { rates: data ?? [], loading: isLoading };
}

export function useCreateRate(activityId?: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: {
      type: TranslationRateType;
      activityId?: number | null;
      name: string;
      amount: number;
      currency: string;
      description?: string;
      clientId?: number | null;
      sourceLanguage?: string;
      targetLanguage?: string;
    }) =>
      gqlRequest<{ createTranslationRate: TranslationRate }>(
        CREATE_TRANSLATION_RATE_MUTATION,
        { input },
      ).then((d) => d.createTranslationRate),
    onSuccess: (created) => {
      const patch = (old?: TranslationRate[]) => [...(old ?? []), created];
      queryClient.setQueryData<TranslationRate[]>(
        ["translationRates", null],
        patch,
      );
      queryClient.setQueryData<TranslationRate[]>(
        ["translationRates", created.type],
        patch,
      );
      if (activityId != null) {
        void queryClient.invalidateQueries({
          queryKey: ["activity", activityId],
        });
      }
    },
  });
  return {
    createRate: (input: Parameters<typeof mutateAsync>[0]) =>
      mutateAsync(input),
    loading: isPending,
  };
}

export function useUpdateRate() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: {
      id: number;
      type?: TranslationRateType;
      activityId?: number | null;
      name?: string;
      amount?: number;
      currency?: string;
      description?: string;
      clientId?: number | null;
      sourceLanguage?: string;
      targetLanguage?: string;
    }) =>
      gqlRequest<{ updateTranslationRate: TranslationRate }>(
        UPDATE_TRANSLATION_RATE_MUTATION,
        { input },
      ).then((d) => d.updateTranslationRate),
    onSuccess: (updated) => {
      const patch = (old?: TranslationRate[]) =>
        old?.map((r) => (r.id === updated.id ? updated : r)) ?? [];
      queryClient.setQueryData<TranslationRate[]>(
        ["translationRates", null],
        patch,
      );
      queryClient.setQueryData<TranslationRate[]>(
        ["translationRates", updated.type],
        patch,
      );
    },
  });
  return {
    updateRate: (input: Parameters<typeof mutateAsync>[0]) =>
      mutateAsync(input),
    loading: isPending,
  };
}

export function useDeleteRate(activityId?: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id: number) =>
      gqlRequest<{ deleteTranslationRate: boolean }>(
        DELETE_TRANSLATION_RATE_MUTATION,
        { id },
      ).then((d) => d.deleteTranslationRate),
    onSuccess: (_data, id) => {
      const patch = (old?: TranslationRate[]) =>
        old?.filter((r) => r.id !== id) ?? [];
      queryClient.setQueryData<TranslationRate[]>(
        ["translationRates", null],
        patch,
      );
      for (const type of [
        "HOURLY",
        "PER_WORD",
        "FIXED",
      ] as TranslationRateType[]) {
        queryClient.setQueryData<TranslationRate[]>(
          ["translationRates", type],
          patch,
        );
      }
      if (activityId != null) {
        void queryClient.invalidateQueries({
          queryKey: ["activity", activityId],
        });
      }
    },
  });
  return { deleteRate: (id: number) => mutateAsync(id) };
}

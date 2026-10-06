import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MY_OCCUPATIONS_QUERY,
  OCCUPATION_QUERY,
  CREATE_OCCUPATION_MUTATION,
  UPDATE_OCCUPATION_MUTATION,
  DELETE_OCCUPATION_MUTATION,
  CREATE_CHARGE_MUTATION,
  UPDATE_CHARGE_MUTATION,
  DELETE_CHARGE_MUTATION,
} from "@/graphql/occupations.operations";
import type { AnyOccupation, OccupationType } from "@/types/occupations.types";
import { gqlMutate } from "@/lib/apollo";
import { useGqlQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import {
  appendToFlatArray,
  patchFlatArray,
  removeFromFlatArray,
} from "@/lib/cachePatch";

export function useMyOccupations() {
  const { data, isLoading } = useGqlQuery({
    queryKey: ["occupations"],
    query: MY_OCCUPATIONS_QUERY,
    select: (d) => d.myOccupations,
  });
  return { occupations: data ?? [], loading: isLoading };
}

export function useOccupation(id: number) {
  const { data, isLoading } = useGqlQuery({
    queryKey: ["occupation", id],
    query: OCCUPATION_QUERY,
    variables: { id },
    select: (d) => d.occupation,
    enabled: !!id,
  });
  return { occupation: data ?? null, loading: isLoading };
}

interface CreateOccupationInput {
  name: string;
  occupationType?: OccupationType | null;
  languagePairs?: { fromLanguage: string; toLanguage: string }[] | null;
  customFields?: { key: string; value: string }[] | null;
}

export function useCreateOccupation() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: CREATE_OCCUPATION_MUTATION,
    unwrap: (d) => d.createOccupation,
    onSuccess: (newOccupation) => {
      appendToFlatArray(queryClient, ["occupations"], newOccupation);
    },
  });
  return {
    createOccupation: (input: CreateOccupationInput) => mutateAsync({ input }),
    loading: isPending,
  };
}

interface UpdateOccupationInput {
  id: number;
  name?: string | null;
  companyName?: string | null;
  legalForm?: string | null;
  professionalEmail?: string | null;
  professionalPhone?: string | null;
  website?: string | null;
  timezone?: string | null;
  objectiveQ1?: number | null;
  objectiveQ2?: number | null;
  objectiveQ3?: number | null;
  objectiveQ4?: number | null;
  languagePairs?: { fromLanguage: string; toLanguage: string }[] | null;
  customFields?: { key: string; value: string }[] | null;
}

// inlineError: the calling form renders the error itself, so skip the global toast.
export function useUpdateOccupation(opts: { inlineError?: boolean } = {}) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: UPDATE_OCCUPATION_MUTATION,
    meta: { inlineError: opts.inlineError },
    unwrap: (d) => d.updateOccupation,
    onSuccess: (updated) => {
      patchFlatArray(queryClient, ["occupations"], updated, (a) => a.id);
      queryClient.setQueryData(["occupation", updated.id], updated);
    },
  });
  return {
    updateOccupation: (input: UpdateOccupationInput) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useDeleteOccupation() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useGqlMutation({
    mutation: DELETE_OCCUPATION_MUTATION,
    unwrap: (d) => d.deleteOccupation,
    onSuccess: (_data, { id }) => {
      removeFromFlatArray(
        queryClient,
        ["occupations"],
        id,
        (a: AnyOccupation) => a.id,
      );
      queryClient.removeQueries({ queryKey: ["occupation", id] });
    },
  });
  return { deleteOccupation: (id: number) => mutateAsync({ id }) };
}

export function useCreateCharge(occupationId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: { name: string; amount: number; type: string }) =>
      gqlMutate<{ createCharge: { id: number } }>(CREATE_CHARGE_MUTATION, {
        input: { ...input, occupationId },
      }).then((d) => d.createCharge),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["occupation", occupationId],
      });
    },
  });
  return {
    createCharge: (input: { name: string; amount: number; type: string }) =>
      mutateAsync(input),
    loading: isPending,
  };
}

export function useUpdateCharge(occupationId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: {
      id: number;
      name?: string | null;
      amount?: number | null;
      type?: string | null;
    }) =>
      gqlMutate<{ updateCharge: { id: number } }>(UPDATE_CHARGE_MUTATION, {
        input,
      }).then((d) => d.updateCharge),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["occupation", occupationId],
      });
    },
  });
  return {
    updateCharge: (input: Parameters<typeof mutateAsync>[0]) =>
      mutateAsync(input),
    loading: isPending,
  };
}

export function useDeleteCharge(occupationId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ deleteCharge: boolean }>(DELETE_CHARGE_MUTATION, {
        id,
      }).then((d) => d.deleteCharge),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["occupation", occupationId],
      });
    },
  });
  return { deleteCharge: (id: number) => mutateAsync(id) };
}

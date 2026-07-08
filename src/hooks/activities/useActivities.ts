import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MY_ACTIVITIES_QUERY,
  ACTIVITY_QUERY,
  CREATE_ACTIVITY_MUTATION,
  UPDATE_ACTIVITY_MUTATION,
  DELETE_ACTIVITY_MUTATION,
  CREATE_CHARGE_MUTATION,
  UPDATE_CHARGE_MUTATION,
  DELETE_CHARGE_MUTATION,
} from "@/graphql/activities.operations";
import type { AnyActivity, ActivityType } from "@/types/activities.types";
import { gqlMutate } from "@/lib/apollo";
import { useGqlQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import {
  appendToFlatArray,
  patchFlatArray,
  removeFromFlatArray,
} from "@/lib/cachePatch";

export function useMyActivities() {
  const { data, isLoading } = useGqlQuery({
    queryKey: ["activities"],
    query: MY_ACTIVITIES_QUERY,
    select: (d) => d.myActivities,
  });
  return { activities: data ?? [], loading: isLoading };
}

export function useActivity(id: number) {
  const { data, isLoading } = useGqlQuery({
    queryKey: ["activity", id],
    query: ACTIVITY_QUERY,
    variables: { id },
    select: (d) => d.activity,
    enabled: !!id,
  });
  return { activity: data ?? null, loading: isLoading };
}

interface CreateActivityInput {
  name: string;
  activityType?: ActivityType | null;
  languagePairs?: { fromLanguage: string; toLanguage: string }[] | null;
  customFields?: { key: string; value: string }[] | null;
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: CREATE_ACTIVITY_MUTATION,
    unwrap: (d) => d.createActivity,
    onSuccess: (newActivity) => {
      appendToFlatArray(queryClient, ["activities"], newActivity);
    },
  });
  return {
    createActivity: (input: CreateActivityInput) => mutateAsync({ input }),
    loading: isPending,
  };
}

interface UpdateActivityInput {
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
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: UPDATE_ACTIVITY_MUTATION,
    unwrap: (d) => d.updateActivity,
    onSuccess: (updated) => {
      patchFlatArray(queryClient, ["activities"], updated, (a) => a.id);
      queryClient.setQueryData(["activity", updated.id], updated);
    },
  });
  return {
    updateActivity: (input: UpdateActivityInput) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useGqlMutation({
    mutation: DELETE_ACTIVITY_MUTATION,
    unwrap: (d) => d.deleteActivity,
    onSuccess: (_data, { id }) => {
      removeFromFlatArray(
        queryClient,
        ["activities"],
        id,
        (a: AnyActivity) => a.id,
      );
      queryClient.removeQueries({ queryKey: ["activity", id] });
    },
  });
  return { deleteActivity: (id: number) => mutateAsync({ id }) };
}

export function useCreateCharge(activityId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: { name: string; amount: number; type: string }) =>
      gqlMutate<{ createCharge: { id: number } }>(CREATE_CHARGE_MUTATION, {
        input: { ...input, activityId },
      }).then((d) => d.createCharge),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["activity", activityId],
      });
    },
  });
  return {
    createCharge: (input: { name: string; amount: number; type: string }) =>
      mutateAsync(input),
    loading: isPending,
  };
}

export function useUpdateCharge(activityId: number) {
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
        queryKey: ["activity", activityId],
      });
    },
  });
  return {
    updateCharge: (input: Parameters<typeof mutateAsync>[0]) =>
      mutateAsync(input),
    loading: isPending,
  };
}

export function useDeleteCharge(activityId: number) {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ deleteCharge: boolean }>(DELETE_CHARGE_MUTATION, {
        id,
      }).then((d) => d.deleteCharge),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["activity", activityId],
      });
    },
  });
  return { deleteCharge: (id: number) => mutateAsync(id) };
}

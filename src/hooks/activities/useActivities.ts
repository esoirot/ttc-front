import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { gqlFetch, gqlMutate } from "@/lib/apollo";

export function useMyActivities() {
  const { data, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () =>
      gqlFetch<{ myActivities: AnyActivity[] }>(MY_ACTIVITIES_QUERY).then(
        (d) => d.myActivities,
      ),
  });
  return { activities: data ?? [], loading: isLoading };
}

export function useActivity(id: number) {
  const { data, isLoading } = useQuery({
    queryKey: ["activity", id],
    queryFn: () =>
      gqlFetch<{ activity: AnyActivity }>(ACTIVITY_QUERY, { id }).then(
        (d) => d.activity,
      ),
    enabled: !!id,
  });
  return { activity: data ?? null, loading: isLoading };
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: {
      name: string;
      activityType?: ActivityType | null;
      languagePairs?: { fromLanguage: string; toLanguage: string }[] | null;
      customFields?: { key: string; value: string }[] | null;
    }) =>
      gqlMutate<{ createActivity: AnyActivity }>(CREATE_ACTIVITY_MUTATION, {
        input,
      }).then((d) => d.createActivity),
    onSuccess: (newActivity) => {
      queryClient.setQueryData<AnyActivity[]>(["activities"], (old) => [
        ...(old ?? []),
        newActivity,
      ]);
    },
  });
  return {
    createActivity: (input: Parameters<typeof mutateAsync>[0]) =>
      mutateAsync(input),
    loading: isPending,
  };
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: {
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
    }) =>
      gqlMutate<{ updateActivity: AnyActivity }>(UPDATE_ACTIVITY_MUTATION, {
        input,
      }).then((d) => d.updateActivity),
    onSuccess: (updated) => {
      queryClient.setQueryData<AnyActivity[]>(
        ["activities"],
        (old) => old?.map((a) => (a.id === updated.id ? updated : a)) ?? [],
      );
      queryClient.setQueryData(["activity", updated.id], updated);
    },
  });
  return {
    updateActivity: (input: Parameters<typeof mutateAsync>[0]) =>
      mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id: number) =>
      gqlMutate<{ deleteActivity: boolean }>(DELETE_ACTIVITY_MUTATION, {
        id,
      }).then((d) => d.deleteActivity),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<AnyActivity[]>(
        ["activities"],
        (old) => old?.filter((a) => a.id !== id) ?? [],
      );
      queryClient.removeQueries({ queryKey: ["activity", id] });
    },
  });
  return { deleteActivity: (id: number) => mutateAsync(id) };
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

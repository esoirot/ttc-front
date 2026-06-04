import { useQuery, useMutation } from "@apollo/client/react";
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
import type { ActivityType } from "@/types/activities.types";

export function useMyActivities() {
  const { data, loading } = useQuery(MY_ACTIVITIES_QUERY);
  return { activities: data?.myActivities ?? [], loading };
}

export function useActivity(id: number) {
  const { data, loading } = useQuery(ACTIVITY_QUERY, {
    variables: { id },
    skip: !id,
  });
  return { activity: data?.activity ?? null, loading };
}

export function useCreateActivity() {
  const [mutate, { loading }] = useMutation(CREATE_ACTIVITY_MUTATION, {
    refetchQueries: [MY_ACTIVITIES_QUERY],
  });
  return {
    createActivity: (input: {
      name: string;
      activityType?: ActivityType | null;
      languagePairs?: { fromLanguage: string; toLanguage: string }[] | null;
      customFields?: { key: string; value: string }[] | null;
    }) => mutate({ variables: { input } }),
    loading,
  };
}

export function useUpdateActivity() {
  const [mutate, { loading, error }] = useMutation(UPDATE_ACTIVITY_MUTATION, {
    refetchQueries: [MY_ACTIVITIES_QUERY],
  });
  return {
    updateActivity: (input: {
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
    }) => mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useDeleteActivity() {
  const [mutate] = useMutation(DELETE_ACTIVITY_MUTATION, {
    refetchQueries: [MY_ACTIVITIES_QUERY],
  });
  return { deleteActivity: (id: number) => mutate({ variables: { id } }) };
}

export function useCreateCharge(activityId: number) {
  const [mutate, { loading }] = useMutation(CREATE_CHARGE_MUTATION, {
    refetchQueries: [{ query: ACTIVITY_QUERY, variables: { id: activityId } }],
  });
  return {
    createCharge: (input: { name: string; amount: number; type: string }) =>
      mutate({
        variables: { input: { ...input, activityId } },
      }),
    loading,
  };
}

export function useUpdateCharge(activityId: number) {
  const [mutate, { loading }] = useMutation(UPDATE_CHARGE_MUTATION, {
    refetchQueries: [{ query: ACTIVITY_QUERY, variables: { id: activityId } }],
  });
  return {
    updateCharge: (input: {
      id: number;
      name?: string | null;
      amount?: number | null;
      type?: string | null;
    }) => mutate({ variables: { input } }),
    loading,
  };
}

export function useDeleteCharge(activityId: number) {
  const [mutate] = useMutation(DELETE_CHARGE_MUTATION, {
    refetchQueries: [{ query: ACTIVITY_QUERY, variables: { id: activityId } }],
  });
  return { deleteCharge: (id: number) => mutate({ variables: { id } }) };
}

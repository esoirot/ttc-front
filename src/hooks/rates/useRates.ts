import { useQuery, useMutation } from "@apollo/client/react";
import {
  RATES_QUERY,
  CREATE_RATE_MUTATION,
  UPDATE_RATE_MUTATION,
  DELETE_RATE_MUTATION,
  type Rate,
  type RateType,
} from "../../graphql/rates.operations";

export type { Rate, RateType };

export function useRates(type?: RateType) {
  const { data, loading } = useQuery(RATES_QUERY, {
    variables: type ? { type } : {},
  });
  return { rates: data?.rates ?? [], loading };
}

export function useCreateRate(type?: RateType) {
  const [mutate, { loading }] = useMutation(CREATE_RATE_MUTATION, {
    refetchQueries: [
      { query: RATES_QUERY, variables: {} },
      ...(type ? [{ query: RATES_QUERY, variables: { type } }] : []),
    ],
  });
  return {
    createRate: (input: {
      type: RateType;
      name: string;
      amount: number;
      currency: string;
      description?: string;
    }) => mutate({ variables: { input } }),
    loading,
  };
}

export function useUpdateRate(type?: RateType) {
  const [mutate, { loading }] = useMutation(UPDATE_RATE_MUTATION, {
    refetchQueries: [
      { query: RATES_QUERY, variables: {} },
      ...(type ? [{ query: RATES_QUERY, variables: { type } }] : []),
    ],
  });
  return {
    updateRate: (input: {
      id: number;
      type?: RateType;
      name?: string;
      amount?: number;
      currency?: string;
      description?: string;
    }) => mutate({ variables: { input } }),
    loading,
  };
}

export function useDeleteRate(type?: RateType) {
  const [mutate] = useMutation(DELETE_RATE_MUTATION, {
    refetchQueries: [
      { query: RATES_QUERY, variables: {} },
      ...(type ? [{ query: RATES_QUERY, variables: { type } }] : []),
    ],
  });
  return { deleteRate: (id: number) => mutate({ variables: { id } }) };
}

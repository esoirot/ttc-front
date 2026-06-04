import { useQuery, useMutation } from "@apollo/client/react";
import {
  TRANSLATION_RATES_QUERY,
  CREATE_TRANSLATION_RATE_MUTATION,
  UPDATE_TRANSLATION_RATE_MUTATION,
  DELETE_TRANSLATION_RATE_MUTATION,
  type TranslationRateType,
} from "../../graphql/rates.operations";

export function useRates(type?: TranslationRateType) {
  const { data, loading } = useQuery(TRANSLATION_RATES_QUERY, {
    variables: type ? { type } : {},
  });
  return { rates: data?.translationRates ?? [], loading };
}

export function useCreateRate(type?: TranslationRateType) {
  const [mutate, { loading }] = useMutation(CREATE_TRANSLATION_RATE_MUTATION, {
    refetchQueries: [
      { query: TRANSLATION_RATES_QUERY, variables: {} },
      ...(type
        ? [{ query: TRANSLATION_RATES_QUERY, variables: { type } }]
        : []),
    ],
  });
  return {
    createRate: (input: {
      type: TranslationRateType;
      name: string;
      amount: number;
      currency: string;
      description?: string;
    }) => mutate({ variables: { input } }),
    loading,
  };
}

export function useUpdateRate(type?: TranslationRateType) {
  const [mutate, { loading }] = useMutation(UPDATE_TRANSLATION_RATE_MUTATION, {
    refetchQueries: [
      { query: TRANSLATION_RATES_QUERY, variables: {} },
      ...(type
        ? [{ query: TRANSLATION_RATES_QUERY, variables: { type } }]
        : []),
    ],
  });
  return {
    updateRate: (input: {
      id: number;
      type?: TranslationRateType;
      name?: string;
      amount?: number;
      currency?: string;
      description?: string;
    }) => mutate({ variables: { input } }),
    loading,
  };
}

export function useDeleteRate(type?: TranslationRateType) {
  const [mutate] = useMutation(DELETE_TRANSLATION_RATE_MUTATION, {
    refetchQueries: [
      { query: TRANSLATION_RATES_QUERY, variables: {} },
      ...(type
        ? [{ query: TRANSLATION_RATES_QUERY, variables: { type } }]
        : []),
    ],
  });
  return { deleteRate: (id: number) => mutate({ variables: { id } }) };
}

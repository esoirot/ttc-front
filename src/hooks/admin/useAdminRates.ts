import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import type { RateType } from "@/types/rates.types";
import {
  ADMIN_RATES_QUERY,
  ADMIN_CREATE_RATE_MUTATION,
  ADMIN_UPDATE_RATE_MUTATION,
  ADMIN_DELETE_RATE_MUTATION,
} from "../../graphql/admin.operations";

export function useAdminRates(type?: RateType) {
  const { data, loading } = useQuery(ADMIN_RATES_QUERY, {
    variables: { type },
    fetchPolicy: "cache-and-network",
  });
  const conn = data?.adminRates;
  return {
    rates: conn?.items ?? [],
    loading,
    total: conn?.total ?? 0,
  };
}

export function useAdminCrudRates() {
  const client = useApolloClient();
  const refetch = () => client.refetchQueries({ include: [ADMIN_RATES_QUERY] });

  const [create] = useMutation(ADMIN_CREATE_RATE_MUTATION, {
    onCompleted: () => void refetch(),
  });
  const [update] = useMutation(ADMIN_UPDATE_RATE_MUTATION, {
    onCompleted: () => void refetch(),
  });
  const [remove] = useMutation(ADMIN_DELETE_RATE_MUTATION, {
    onCompleted: () => void refetch(),
  });

  return {
    createRate: (input: Parameters<typeof create>[0]["variables"]["input"]) =>
      create({ variables: { input } }),
    updateRate: (input: Parameters<typeof update>[0]["variables"]["input"]) =>
      update({ variables: { input } }),
    deleteRate: (id: number) => remove({ variables: { id } }),
  };
}

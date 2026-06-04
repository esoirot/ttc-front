import { useQuery, useMutation } from "@apollo/client/react";
import {
  RATE_SHEETS_QUERY,
  CREATE_RATE_SHEET_MUTATION,
  UPDATE_RATE_SHEET_MUTATION,
  DELETE_RATE_SHEET_MUTATION,
} from "@/graphql/rate-sheets.operations";
import type {
  CreateRateSheetInput,
  UpdateRateSheetInput,
} from "@/types/rate-sheets.types";

export function useRateSheets() {
  const { data, loading } = useQuery(RATE_SHEETS_QUERY);
  return { rateSheets: data?.rateSheets ?? [], loading };
}

export function useCreateRateSheet() {
  const [mutate, { loading }] = useMutation(CREATE_RATE_SHEET_MUTATION, {
    refetchQueries: [{ query: RATE_SHEETS_QUERY }],
  });
  return {
    createRateSheet: (input: CreateRateSheetInput) =>
      mutate({ variables: { input } }),
    loading,
  };
}

export function useUpdateRateSheet() {
  const [mutate, { loading }] = useMutation(UPDATE_RATE_SHEET_MUTATION, {
    refetchQueries: [{ query: RATE_SHEETS_QUERY }],
  });
  return {
    updateRateSheet: (input: UpdateRateSheetInput) =>
      mutate({ variables: { input } }),
    loading,
  };
}

export function useDeleteRateSheet() {
  const [mutate] = useMutation(DELETE_RATE_SHEET_MUTATION, {
    refetchQueries: [{ query: RATE_SHEETS_QUERY }],
  });
  return { deleteRateSheet: (id: number) => mutate({ variables: { id } }) };
}

import { useQueryClient } from "@tanstack/react-query";
import {
  RATE_SHEETS_QUERY,
  CREATE_RATE_SHEET_MUTATION,
  UPDATE_RATE_SHEET_MUTATION,
  DELETE_RATE_SHEET_MUTATION,
} from "@/graphql/rate-sheets.operations";
import type {
  RateSheet,
  CreateRateSheetInput,
  UpdateRateSheetInput,
} from "@/types/rate-sheets.types";
import { useGqlQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import {
  appendToFlatArray,
  patchFlatArray,
  removeFromFlatArray,
} from "@/lib/cachePatch";

export function useRateSheets() {
  const { data, isLoading } = useGqlQuery({
    queryKey: ["rateSheets"],
    query: RATE_SHEETS_QUERY,
    select: (d) => d.rateSheets,
  });
  return { rateSheets: data ?? [], loading: isLoading };
}

export function useCreateRateSheet() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: CREATE_RATE_SHEET_MUTATION,
    unwrap: (d) => d.createRateSheet,
    onSuccess: (created) => {
      appendToFlatArray(queryClient, ["rateSheets"], created);
    },
  });
  return {
    createRateSheet: (input: CreateRateSheetInput) => mutateAsync({ input }),
    loading: isPending,
  };
}

export function useUpdateRateSheet() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: UPDATE_RATE_SHEET_MUTATION,
    unwrap: (d) => d.updateRateSheet,
    onSuccess: (updated) => {
      patchFlatArray(queryClient, ["rateSheets"], updated, (rs) => rs.id);
    },
  });
  return {
    updateRateSheet: (input: UpdateRateSheetInput) => mutateAsync({ input }),
    loading: isPending,
  };
}

export function useDeleteRateSheet() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useGqlMutation({
    mutation: DELETE_RATE_SHEET_MUTATION,
    unwrap: (d) => d.deleteRateSheet,
    onSuccess: (_data, { id }) => {
      removeFromFlatArray(
        queryClient,
        ["rateSheets"],
        id,
        (rs: RateSheet) => rs.id,
      );
    },
  });
  return { deleteRateSheet: (id: number) => mutateAsync({ id }) };
}

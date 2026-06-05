import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { gqlRequest } from "@/lib/api";

export function useRateSheets() {
  const { data, isLoading } = useQuery({
    queryKey: ["rateSheets"],
    queryFn: () =>
      gqlRequest<{ rateSheets: RateSheet[] }>(RATE_SHEETS_QUERY).then(
        (d) => d.rateSheets,
      ),
  });
  return { rateSheets: data ?? [], loading: isLoading };
}

export function useCreateRateSheet() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: CreateRateSheetInput) =>
      gqlRequest<{ createRateSheet: RateSheet }>(CREATE_RATE_SHEET_MUTATION, {
        input,
      }).then((d) => d.createRateSheet),
    onSuccess: (created) => {
      queryClient.setQueryData<RateSheet[]>(["rateSheets"], (old) => [
        ...(old ?? []),
        created,
      ]);
    },
  });
  return {
    createRateSheet: (input: CreateRateSheetInput) => mutateAsync(input),
    loading: isPending,
  };
}

export function useUpdateRateSheet() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: UpdateRateSheetInput) =>
      gqlRequest<{ updateRateSheet: RateSheet }>(UPDATE_RATE_SHEET_MUTATION, {
        input,
      }).then((d) => d.updateRateSheet),
    onSuccess: (updated) => {
      queryClient.setQueryData<RateSheet[]>(
        ["rateSheets"],
        (old) => old?.map((rs) => (rs.id === updated.id ? updated : rs)) ?? [],
      );
    },
  });
  return {
    updateRateSheet: (input: UpdateRateSheetInput) => mutateAsync(input),
    loading: isPending,
  };
}

export function useDeleteRateSheet() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id: number) =>
      gqlRequest<{ deleteRateSheet: boolean }>(DELETE_RATE_SHEET_MUTATION, {
        id,
      }).then((d) => d.deleteRateSheet),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<RateSheet[]>(
        ["rateSheets"],
        (old) => old?.filter((rs) => rs.id !== id) ?? [],
      );
    },
  });
  return { deleteRateSheet: (id: number) => mutateAsync(id) };
}

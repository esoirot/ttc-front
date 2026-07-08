import type { TypedDocumentNode } from "@apollo/client/core";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { gqlMutate } from "@/lib/apollo";

export function useGqlMutation<
  TData,
  TVariables extends Record<string, unknown>,
  TResult = TData,
>(opts: {
  mutation: TypedDocumentNode<TData, TVariables>;
  unwrap: (data: TData) => TResult;
  onSuccess?: (result: TResult, variables: TVariables) => void;
}): UseMutationResult<TResult, Error, TVariables> {
  return useMutation({
    mutationFn: (variables: TVariables) =>
      gqlMutate<TData>(opts.mutation, variables).then((d) => opts.unwrap(d)),
    onSuccess: opts.onSuccess,
  });
}

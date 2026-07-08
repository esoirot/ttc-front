import { useQueryClient } from "@tanstack/react-query";
import {
  TAGS_QUERY,
  CREATE_TAG_MUTATION,
  DELETE_TAG_MUTATION,
} from "../../graphql/tags.operations";
import type { Tag } from "@/types/tags.types";
import { useGqlQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import { appendToFlatArray, removeFromFlatArray } from "@/lib/cachePatch";

export function useTags() {
  const { data, isLoading } = useGqlQuery({
    queryKey: ["tags"],
    query: TAGS_QUERY,
    select: (d) => d.tags ?? [],
  });
  return { tags: data ?? [], loading: isLoading };
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useGqlMutation({
    mutation: CREATE_TAG_MUTATION,
    unwrap: (d) => d.createTag,
    onSuccess: (newTag) => {
      appendToFlatArray(queryClient, ["tags"], newTag);
    },
  });
  return {
    createTag: (name: string) => mutateAsync({ input: { name } }),
    loading: isPending,
  };
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useGqlMutation({
    mutation: DELETE_TAG_MUTATION,
    unwrap: (d) => d.deleteTag,
    onSuccess: (_data, { id }) => {
      removeFromFlatArray(queryClient, ["tags"], id, (t: Tag) => t.id);
    },
  });
  return { deleteTag: (id: number) => mutateAsync({ id }) };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TAGS_QUERY,
  CREATE_TAG_MUTATION,
  DELETE_TAG_MUTATION,
} from "../../graphql/tags.operations";
import type { Tag } from "@/types/tags.types";
import { gqlRequest } from "@/lib/api";

export function useTags() {
  const { data, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: () => gqlRequest<{ tags: Tag[] }>(TAGS_QUERY).then((d) => d.tags),
  });
  return { tags: data ?? [], loading: isLoading };
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (name: string) =>
      gqlRequest<{ createTag: Tag }>(CREATE_TAG_MUTATION, {
        input: { name },
      }).then((d) => d.createTag),
    onSuccess: (newTag) => {
      queryClient.setQueryData<Tag[]>(["tags"], (old) => [
        ...(old ?? []),
        newTag,
      ]);
    },
  });
  return {
    createTag: (name: string) => mutateAsync(name),
    loading: isPending,
  };
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (id: number) =>
      gqlRequest<{ deleteTag: boolean }>(DELETE_TAG_MUTATION, { id }).then(
        (d) => d.deleteTag,
      ),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Tag[]>(
        ["tags"],
        (old) => old?.filter((t) => t.id !== id) ?? [],
      );
    },
  });
  return { deleteTag: (id: number) => mutateAsync(id) };
}

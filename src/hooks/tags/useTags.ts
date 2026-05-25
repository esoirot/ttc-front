import { useQuery, useMutation } from "@apollo/client/react";
import {
  TAGS_QUERY,
  CREATE_TAG_MUTATION,
  DELETE_TAG_MUTATION,
} from "../../graphql/tags.operations";

export function useTags() {
  const { data, loading } = useQuery(TAGS_QUERY);
  return { tags: data?.tags ?? [], loading };
}

export function useCreateTag() {
  const [mutate, { loading }] = useMutation(CREATE_TAG_MUTATION, {
    refetchQueries: [{ query: TAGS_QUERY }],
  });
  return {
    createTag: (name: string) =>
      mutate({ variables: { input: { name } } }).then((r) => r.data!.createTag),
    loading,
  };
}

export function useDeleteTag() {
  const [mutate] = useMutation(DELETE_TAG_MUTATION, {
    refetchQueries: [{ query: TAGS_QUERY }],
  });
  return { deleteTag: (id: number) => mutate({ variables: { id } }) };
}

import { useQuery, useMutation } from "@apollo/client/react";
import {
  PROJECTS_QUERY,
  PROJECT_QUERY,
  CREATE_PROJECT_MUTATION,
  UPDATE_PROJECT_MUTATION,
  DELETE_PROJECT_MUTATION,
  type ProjectStatus,
} from "../../graphql/projects.operations";

const LIMIT = 20;

export function useProjects(status?: ProjectStatus, search?: string) {
  const baseVars = {
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
    pagination: { limit: LIMIT },
  };

  const { data, fetchMore, loading, error } = useQuery(PROJECTS_QUERY, {
    variables: baseVars,
  });

  const nextCursor = data?.projects.nextCursor ?? null;

  function loadMore() {
    void fetchMore({
      variables: {
        ...baseVars,
        pagination: { limit: LIMIT, cursor: nextCursor ?? undefined },
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          projects: {
            ...fetchMoreResult.projects,
            items: [...prev.projects.items, ...fetchMoreResult.projects.items],
          },
        };
      },
    });
  }

  return {
    projects: data?.projects.items ?? [],
    total: data?.projects.total ?? 0,
    hasMore: nextCursor !== null,
    loadMore,
    loading,
    error,
  };
}

export function useProject(id: number) {
  const { data, loading, error } = useQuery(PROJECT_QUERY, {
    variables: { id },
  });
  return { project: data?.project ?? null, loading, error };
}

export function useCreateProject() {
  const [mutate, { loading, error }] = useMutation(CREATE_PROJECT_MUTATION, {
    refetchQueries: [
      { query: PROJECTS_QUERY, variables: { pagination: { limit: LIMIT } } },
    ],
  });
  return {
    createProject: (
      input: Parameters<typeof mutate>[0]["variables"]["input"],
    ) => mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useUpdateProject() {
  const [mutate, { loading, error }] = useMutation(UPDATE_PROJECT_MUTATION, {
    refetchQueries: [
      { query: PROJECTS_QUERY, variables: { pagination: { limit: LIMIT } } },
    ],
  });
  return {
    updateProject: (
      input: Parameters<typeof mutate>[0]["variables"]["input"],
    ) => mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useDeleteProject() {
  const [mutate, { loading, error }] = useMutation(DELETE_PROJECT_MUTATION, {
    refetchQueries: [
      { query: PROJECTS_QUERY, variables: { pagination: { limit: LIMIT } } },
    ],
  });
  return {
    deleteProject: (id: number) => mutate({ variables: { id } }),
    loading,
    error,
  };
}

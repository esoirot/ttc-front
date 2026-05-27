import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import type { ProjectStatus } from "@/types/projects.types";
import {
  ADMIN_PROJECTS_QUERY,
  ADMIN_CREATE_PROJECT_MUTATION,
  ADMIN_UPDATE_PROJECT_MUTATION,
  ADMIN_DELETE_PROJECT_MUTATION,
} from "../../graphql/admin.operations";

const LIMIT = 20;

export function useAdminProjects(status?: ProjectStatus, search?: string) {
  const { data, loading, fetchMore } = useQuery(ADMIN_PROJECTS_QUERY, {
    variables: { status, search, pagination: { limit: LIMIT } },
    fetchPolicy: "cache-and-network",
  });
  const conn = data?.adminProjects;
  return {
    projects: conn?.items ?? [],
    loading,
    total: conn?.total ?? 0,
    hasMore: conn?.nextCursor !== null && conn?.nextCursor !== undefined,
    loadMore: () =>
      fetchMore({
        variables: {
          status,
          search,
          pagination: { limit: LIMIT, cursor: conn?.nextCursor ?? undefined },
        },
        updateQuery: (prev, { fetchMoreResult }) => ({
          adminProjects: {
            ...fetchMoreResult.adminProjects,
            items: [
              ...prev.adminProjects.items,
              ...fetchMoreResult.adminProjects.items,
            ],
          },
        }),
      }),
  };
}

export function useAdminCrudProjects() {
  const client = useApolloClient();
  const refetch = () =>
    client.refetchQueries({ include: [ADMIN_PROJECTS_QUERY] });

  const [create] = useMutation(ADMIN_CREATE_PROJECT_MUTATION, {
    onCompleted: () => void refetch(),
  });
  const [update] = useMutation(ADMIN_UPDATE_PROJECT_MUTATION, {
    onCompleted: () => void refetch(),
  });
  const [remove] = useMutation(ADMIN_DELETE_PROJECT_MUTATION, {
    onCompleted: () => void refetch(),
  });

  return {
    createProject: (
      input: Parameters<typeof create>[0]["variables"]["input"],
    ) => create({ variables: { input } }),
    updateProject: (
      input: Parameters<typeof update>[0]["variables"]["input"],
    ) => update({ variables: { input } }),
    deleteProject: (id: number) => remove({ variables: { id } }),
  };
}

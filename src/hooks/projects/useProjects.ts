import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PROJECTS_QUERY,
  PROJECT_QUERY,
  CREATE_PROJECT_MUTATION,
  UPDATE_PROJECT_MUTATION,
  DELETE_PROJECT_MUTATION,
} from "../../graphql/projects.operations";
import type {
  Project,
  ProjectInput,
  ProjectStatus,
  UpdateProjectInput,
} from "@/types/projects.types";
import { gqlFetch } from "@/lib/apollo";
import { useGqlConnectionQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import { patchConnection, removeFromConnection } from "@/lib/cachePatch";

const LIMIT = 20;

export function useProjects(status?: ProjectStatus, search?: string) {
  const baseVars = {
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
  };

  const { items, total, hasMore, loadMore, loading, error } =
    useGqlConnectionQuery({
      queryKey: [
        "projects",
        { status: status ?? null, search: search ?? null },
      ],
      query: PROJECTS_QUERY,
      variables: baseVars,
      select: (d) => d.projects,
      limit: LIMIT,
    });

  return { projects: items, total, hasMore, loadMore, loading, error };
}

export function useProject(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: () =>
      gqlFetch<{ project: Project | null }>(PROJECT_QUERY, {
        id,
      }).then((d) => d.project),
    enabled: !!id,
  });
  return { project: data ?? null, loading: isLoading, error };
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: CREATE_PROJECT_MUTATION,
    unwrap: (d) => d.createProject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
  return {
    createProject: (input: ProjectInput) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: UPDATE_PROJECT_MUTATION,
    unwrap: (d) => d.updateProject,
    onSuccess: (updated) => {
      patchConnection(queryClient, ["projects"], updated, (p) => p.id);
      queryClient.setQueryData(["project", updated.id], updated);
    },
  });
  return {
    updateProject: (input: UpdateProjectInput) => mutateAsync({ input }),
    loading: isPending,
    error,
  };
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: DELETE_PROJECT_MUTATION,
    unwrap: (d) => d.deleteProject,
    onSuccess: (_data, { id }) => {
      removeFromConnection(queryClient, ["projects"], id, (p: Project) => p.id);
      queryClient.removeQueries({ queryKey: ["project", id] });
    },
  });
  return {
    deleteProject: (id: number) => mutateAsync({ id }),
    loading: isPending,
    error,
  };
}

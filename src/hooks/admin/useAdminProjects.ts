import { useQueryClient } from "@tanstack/react-query";
import type { ProjectStatus } from "@/types/projects.types";
import {
  ADMIN_PROJECTS_QUERY,
  ADMIN_CREATE_PROJECT_MUTATION,
  ADMIN_UPDATE_PROJECT_MUTATION,
  ADMIN_DELETE_PROJECT_MUTATION,
} from "../../graphql/admin.operations";
import type { AdminProject } from "@/types/admin.types";
import { useGqlConnectionQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import { patchConnection, removeFromConnection } from "@/lib/cachePatch";

const LIMIT = 20;

export function useAdminProjects(status?: ProjectStatus, search?: string) {
  const { items, total, hasMore, loadMore, loading } = useGqlConnectionQuery({
    queryKey: [
      "adminProjects",
      { status: status ?? null, search: search ?? null },
    ],
    query: ADMIN_PROJECTS_QUERY,
    variables: { status, search },
    select: (d) => d.adminProjects,
    limit: LIMIT,
  });

  return {
    projects: items,
    loading,
    total,
    hasMore,
    loadMore,
  };
}

export function useAdminCrudProjects() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["adminProjects"] });

  const { mutateAsync: create } = useGqlMutation({
    mutation: ADMIN_CREATE_PROJECT_MUTATION,
    unwrap: (d) => d.adminCreateProject,
    onSuccess: invalidate,
  });

  const { mutateAsync: update } = useGqlMutation({
    mutation: ADMIN_UPDATE_PROJECT_MUTATION,
    unwrap: (d) => d.adminUpdateProject,
    onSuccess: (updated) => {
      patchConnection(queryClient, ["adminProjects"], updated, (p) => p.id);
    },
  });

  const { mutateAsync: remove } = useGqlMutation({
    mutation: ADMIN_DELETE_PROJECT_MUTATION,
    unwrap: (d) => d.adminDeleteProject,
    onSuccess: (_data, { id }) => {
      removeFromConnection(
        queryClient,
        ["adminProjects"],
        id,
        (p: AdminProject) => p.id,
      );
    },
  });

  return {
    createProject: (input: {
      userId: number;
      title: string;
      status?: ProjectStatus;
      clientId?: number;
      currency?: string;
    }) => create({ input }),
    updateProject: (input: {
      id: number;
      title?: string;
      status?: ProjectStatus;
      description?: string;
      wordCount?: number;
      unitPrice?: number;
      deadline?: string;
    }) => update({ input }),
    deleteProject: (id: number) => remove({ id }),
  };
}

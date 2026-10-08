import { PROJECT_ACTIVITIES_QUERY } from "@/graphql/tasks.operations";
import { useGqlConnectionQuery } from "@/lib/gqlQuery";

/** A project's task history, newest first, 20 events at a time. */
export function useProjectActivities(projectId: number) {
  return useGqlConnectionQuery({
    queryKey: ["projectActivities", projectId],
    query: PROJECT_ACTIVITIES_QUERY,
    variables: { projectId },
    select: (d) => d.projectActivities,
    limit: 20,
  });
}

import { useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject, useUpdateProject } from "../../hooks/projects/useProjects";
import { useTasks } from "../../hooks/tasks/useTasks";
import {
  useTimeEntries,
  useStartTimer,
  useStopTimer,
  useActiveTimer,
} from "../../hooks/time/useTimeEntries";
import { useMembers, type Member } from "../../hooks/account/useUsers";
import { TasksTab } from "../../components/projects/TasksTab";
import { ProjectTaskList } from "../../components/projects/ProjectTaskList";
import { TimeTab } from "../../components/projects/TimeTab";
import { OverviewTab } from "../../components/projects/OverviewTab";
import { ProjectHeader } from "../../components/projects/ProjectHeader";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const { project, loading: projectLoading } = useProject(projectId);
  const { updateProject, loading: updatingProject } = useUpdateProject();
  const {
    tasks,
    loading: tasksLoading,
    hasMore: taskHasMore,
    loadMore: taskLoadMore,
  } = useTasks(projectId);
  const { entries, loading: entriesLoading } = useTimeEntries({ projectId });
  const { activeTimer } = useActiveTimer();
  const { startTimer, loading: starting } = useStartTimer();
  const { stopTimer, loading: stopping } = useStopTimer();
  const { members } = useMembers();

  const memberMap = Object.fromEntries(
    members.map((m: Member) => [m.id, m.name ?? m.email]),
  );

  const totalSeconds = entries.reduce(
    (sum, e) => sum + (e.durationSeconds ?? 0),
    0,
  );

  if (projectLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <ProjectHeader
        project={project}
        onUpdate={updateProject}
        saving={updatingProject}
      />

      <div className="mb-6">
        <OverviewTab project={project} totalSeconds={totalSeconds} />
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <ProjectTaskList projectId={projectId} members={members} />
        </TabsContent>

        <TabsContent value="kanban" className="mt-4">
          <TasksTab
            projectId={projectId}
            tasks={tasks}
            tasksLoading={tasksLoading}
            taskHasMore={taskHasMore}
            taskLoadMore={taskLoadMore}
            members={members}
            memberMap={memberMap}
          />
        </TabsContent>

        <TabsContent value="time" className="mt-4">
          <TimeTab
            projectId={projectId}
            entries={entries}
            entriesLoading={entriesLoading}
            activeTimer={activeTimer}
            startTimer={startTimer}
            stopTimer={stopTimer}
            starting={starting}
            stopping={stopping}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

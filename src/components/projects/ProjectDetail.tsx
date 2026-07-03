import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject, useUpdateProject } from "@/hooks/projects/useProjects";
import { useClients } from "@/hooks/clients/useClients";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useProjectTimeTab } from "@/hooks/projects/useProjectTimeTab";
import { useMembers } from "@/hooks/account/useUsers";
import { useCurrentUser } from "@/hooks/auth/useAuth";
import type { Member } from "@/types/users.types";
import { ProjectHeader } from "./headers/ProjectHeader";
import { OverviewTab } from "./tabs/OverviewTab";
import { ProjectTaskList } from "./lists/ProjectTaskList";
import { TasksTab } from "./tabs/TasksTab";
import { TimeTab } from "./tabs/TimeTab";
import { TaskDetailModal } from "./modals/TaskDetailModal";

export function ProjectDetail() {
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
  const timeTab = useProjectTimeTab(projectId);
  const { members } = useMembers();
  const { clients } = useClients();
  const { user: currentUser } = useCurrentUser();

  const [openTaskId, setOpenTaskId] = useState<number | null>(null);

  const memberMap = Object.fromEntries(
    members.map((m: Member) => [m.id, m.name ?? m.email]),
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
        clients={clients}
        onUpdate={updateProject}
        saving={updatingProject}
      />

      <div className="mb-6">
        <OverviewTab
          project={project}
          totalSeconds={timeTab.totalSeconds}
          tasks={tasks}
        />
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <ProjectTaskList
            projectId={projectId}
            members={members}
            onOpenModal={setOpenTaskId}
          />
        </TabsContent>

        <TabsContent value="kanban" className="mt-4">
          <TasksTab
            projectId={projectId}
            tasks={tasks}
            tasksLoading={tasksLoading}
            taskHasMore={taskHasMore}
            taskLoadMore={taskLoadMore}
            memberMap={memberMap}
            onOpenModal={setOpenTaskId}
          />
        </TabsContent>

        <TabsContent value="time" className="mt-4">
          <TimeTab
            projectId={projectId}
            entries={timeTab.entries}
            loading={timeTab.loading}
            hasMore={timeTab.hasMore}
            loadMore={timeTab.loadMore}
            refetch={timeTab.refetch}
            activeTimer={timeTab.activeTimer}
            stopTimer={timeTab.stopTimer}
            stopping={timeTab.stopping}
            deleteTimeEntry={timeTab.deleteTimeEntry}
            updateTimeEntry={timeTab.updateTimeEntry}
            projects={timeTab.projects}
            tags={timeTab.tags}
            recentDescriptions={timeTab.recentDescriptions}
            handleResume={timeTab.handleResume}
          />
        </TabsContent>
      </Tabs>

      {openTaskId !== null && (
        <TaskDetailModal
          taskId={openTaskId}
          projectId={projectId}
          open={openTaskId !== null}
          onClose={() => setOpenTaskId(null)}
          currentUserId={currentUser?.id ? Number(currentUser.id) : undefined}
        />
      )}
    </div>
  );
}

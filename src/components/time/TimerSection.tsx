import type { TimeEntry } from "@/types/time-entries.types";
import type { Project } from "@/types/projects.types";
import type { Tag } from "@/types/tags.types";
import { ActiveTimerBanner } from "./ActiveTimerBanner";
import { TimerStartInput } from "./TimerStartInput";

export function TimerSection({
  activeTimer,
  stopTimer,
  stopping,
  refetch,
  projects,
  tags,
  recentDescriptions,
  initialProjectId,
}: {
  activeTimer: TimeEntry | null | undefined;
  stopTimer: () => Promise<unknown>;
  stopping: boolean;
  refetch: () => void;
  projects: Project[];
  tags: Tag[];
  recentDescriptions: string[];
  initialProjectId?: number | null;
}) {
  if (activeTimer) {
    return (
      <ActiveTimerBanner
        activeTimer={activeTimer}
        stopTimer={stopTimer}
        stopping={stopping}
        refetch={refetch}
      />
    );
  }

  return (
    <TimerStartInput
      projects={projects}
      tags={tags}
      recentDescriptions={recentDescriptions}
      initialProjectId={initialProjectId}
    />
  );
}

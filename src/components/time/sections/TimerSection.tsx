import type { TimerSectionProps } from "@/types/shared-ui.types";
import { ActiveTimerBanner } from "../banners/ActiveTimerBanner";
import { TimerStartInput } from "../form-inputs/TimerStartInput";

export function TimerSection({
  activeTimer,
  stopTimer,
  stopping,
  refetch,
  tags,
  recentDescriptions,
  initialProjectId,
  initialTaskId,
  initialTaskTitle,
}: TimerSectionProps) {
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
      tags={tags}
      recentDescriptions={recentDescriptions}
      initialProjectId={initialProjectId}
      initialTaskId={initialTaskId}
      initialTaskTitle={initialTaskTitle}
    />
  );
}

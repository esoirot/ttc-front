import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { TaskActivity } from "@/types/tasks.types";
import { TaskActivityFeed } from "../modals/TaskActivityFeed";

export function TaskActivityGroup({
  taskTitle,
  activities,
}: {
  taskTitle: string;
  activities: TaskActivity[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-none h-auto justify-start hover:bg-accent/50"
      >
        <span className="text-muted-foreground text-xs w-3 shrink-0">
          {expanded ? "▼" : "▶"}
        </span>
        <span className="text-sm truncate flex-1 text-left">{taskTitle}</span>
        <span className="text-xs text-muted-foreground shrink-0">
          ×{activities.length}
        </span>
      </Button>
      {expanded && (
        <div className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
          <TaskActivityFeed activities={activities} />
        </div>
      )}
    </div>
  );
}

import {
  type ClockifyTimeEntry,
  type ClockifyProject,
  type ClockifyTag,
  type UpdateEntryInput,
} from "../../hooks/useClockify";
import { formatTime, secsToHms } from "./helpers";
import { BillableToggle } from "./BillableToggle";
import { ProjectSelect } from "./ProjectSelect";
import { TagChips } from "./TagChips";

export function EntryRow({
  workspaceId,
  entry,
  projects,
  tags,
  onDelete,
  onResume,
  onUpdate,
}: {
  workspaceId: string;
  entry: ClockifyTimeEntry;
  projects: ClockifyProject[];
  tags: ClockifyTag[];
  onDelete: (id: string) => void;
  onResume: (entry: ClockifyTimeEntry) => void;
  onUpdate: (input: UpdateEntryInput) => void;
}) {
  const start = entry.timeInterval.start;
  const end = entry.timeInterval.end;
  const durationSecs = end
    ? Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000)
    : 0;

  function patch(
    partial: Partial<
      Pick<UpdateEntryInput, "projectId" | "billable" | "tagIds">
    >,
  ) {
    onUpdate({
      entryId: entry.id,
      start: entry.timeInterval.start,
      end: entry.timeInterval.end ?? undefined,
      description: entry.description ?? "",
      projectId:
        partial.projectId !== undefined ? partial.projectId : entry.projectId,
      billable:
        partial.billable !== undefined ? partial.billable : entry.billable,
      tagIds:
        partial.tagIds !== undefined ? partial.tagIds : (entry.tagIds ?? []),
    });
  }

  const entryTagIds = entry.tagIds ?? [];

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <p className="text-sm text-zinc-900 dark:text-white truncate">
          {entry.description || (
            <span className="italic text-zinc-400">No description</span>
          )}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <ProjectSelect
            projectId={entry.projectId}
            projects={projects}
            onChange={(id) => patch({ projectId: id })}
          />
          <TagChips
            workspaceId={workspaceId}
            tagIds={entryTagIds}
            tags={tags}
            onAdd={(id) => patch({ tagIds: [...entryTagIds, id] })}
            onRemove={(id) =>
              patch({ tagIds: entryTagIds.filter((t) => t !== id) })
            }
          />
          <BillableToggle
            billable={entry.billable}
            onChange={(v) => patch({ billable: v })}
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 dark:text-zinc-500">
          <span>{formatTime(start)}</span>
          <span>–</span>
          {end ? (
            <span>{formatTime(end)}</span>
          ) : (
            <span className="text-violet-500">running</span>
          )}
          <span className="mx-0.5">·</span>
          <span>{end ? secsToHms(durationSecs) : "—"}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 pt-1">
        <button
          onClick={() => onResume(entry)}
          className="text-zinc-400 hover:text-emerald-600 transition-colors text-xs"
          aria-label="Resume entry"
        >
          ▶
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="text-zinc-400 hover:text-red-600 transition-colors text-xs"
          aria-label="Delete entry"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

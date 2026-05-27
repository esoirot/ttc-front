export function renderAssigneeDisplay(
  assigneeId: number | null | undefined,
  memberMap: Record<number, string>,
) {
  if (!assigneeId || !memberMap[assigneeId]) return null;
  return (
    <span className="hidden text-xs text-muted-foreground">
      @{memberMap[assigneeId]}
    </span>
  );
}

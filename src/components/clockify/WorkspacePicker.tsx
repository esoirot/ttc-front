import {
  useClockifyWorkspaces,
  useSetClockifyWorkspace,
} from "../../hooks/useClockify";

export function WorkspacePicker() {
  const { data: workspaces, isLoading } = useClockifyWorkspaces();
  const { mutate: setWorkspace, isPending } = useSetClockifyWorkspace();

  if (isLoading)
    return <p className="text-sm text-zinc-500">Loading workspaces…</p>;

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Select your default workspace:
      </p>
      {(workspaces ?? []).map((ws) => (
        <button
          key={ws.id}
          onClick={() => setWorkspace(ws.id)}
          disabled={isPending}
          className="px-4 py-3 rounded-md border border-zinc-200 dark:border-zinc-700 text-left text-sm font-medium text-zinc-900 dark:text-white hover:border-violet-500 hover:text-violet-600 disabled:opacity-50 transition-colors"
        >
          {ws.name}
        </button>
      ))}
    </div>
  );
}

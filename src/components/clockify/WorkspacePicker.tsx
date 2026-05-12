import {
  useClockifyWorkspaces,
  useSetClockifyWorkspace,
} from "../../hooks/useClockify";
import { Button } from "@/components/ui/button";

export function WorkspacePicker() {
  const { data: workspaces, isLoading } = useClockifyWorkspaces();
  const { mutate: setWorkspace, isPending } = useSetClockifyWorkspace();

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading workspaces…</p>;

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <p className="text-sm text-muted-foreground">
        Select your default workspace:
      </p>
      {(workspaces ?? []).map((ws) => (
        <Button
          key={ws.id}
          variant="outline"
          className="justify-start"
          onClick={() => setWorkspace(ws.id)}
          disabled={isPending}
        >
          {ws.name}
        </Button>
      ))}
    </div>
  );
}

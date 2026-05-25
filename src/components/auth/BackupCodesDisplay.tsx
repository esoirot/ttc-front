import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BackupCodesDisplayProps } from "@/types/auth.types";

export function BackupCodesDisplay({ codes, onDone }: BackupCodesDisplayProps) {
  function copyAll() {
    void navigator.clipboard.writeText(codes.join("\n"));
  }

  return (
    <div className="flex flex-col gap-4">
      <Badge
        variant="secondary"
        className="w-fit text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
      >
        ✓ Enabled
      </Badge>
      <Alert>
        <AlertDescription className="flex flex-col gap-3">
          <p className="font-medium text-sm">
            Save these backup codes — they won't be shown again. Each code can
            only be used once.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {codes.map((c) => (
              <code
                key={c}
                className="px-2 py-1 bg-muted rounded font-mono text-xs"
              >
                {c}
              </code>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={copyAll}
          >
            Copy all codes
          </Button>
        </AlertDescription>
      </Alert>
      <Button variant="ghost" size="sm" className="self-start" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}

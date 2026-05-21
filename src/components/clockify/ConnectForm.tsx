import { useState } from "react";
import { useSetClockifyCredentials } from "../../hooks/integrations/useClockify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ConnectForm() {
  const [apiKey, setApiKey] = useState("");
  const { mutate: save, isPending, error } = useSetClockifyCredentials();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!apiKey.trim()) return;
    save({ apiKey: apiKey.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clockify-api-key">Clockify API Key</Label>
        <Input
          id="clockify-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Clockify API key"
        />
        <p className="text-xs text-muted-foreground">
          Find it in Clockify → Profile → API key
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      <Button
        type="submit"
        disabled={isPending || !apiKey.trim()}
        className="self-start"
      >
        {isPending ? "Connecting…" : "Connect Clockify"}
      </Button>
    </form>
  );
}

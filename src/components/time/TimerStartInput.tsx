import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStartTimer } from "../../hooks/time/useTimeEntries";

export function TimerStartInput() {
  const { startTimer, loading: starting } = useStartTimer();
  const [desc, setDesc] = useState("");

  return (
    <div className="flex gap-2 mb-4">
      <Label htmlFor="timer-desc" className="sr-only">
        Description
      </Label>
      <Input
        id="timer-desc"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="What are you working on?"
        className="flex-1"
      />
      <Button
        onClick={() => void startTimer({ description: desc || undefined })}
        disabled={starting}
      >
        {starting ? "Starting…" : "▶ Start"}
      </Button>
    </div>
  );
}

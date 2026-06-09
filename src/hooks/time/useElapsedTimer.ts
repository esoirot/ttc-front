import { formatDuration } from "@/lib/time";
import { useState, useEffect } from "react";

export function useElapsedTimer(startIso: string | null | undefined): string {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!startIso) {
      const id = setTimeout(() => setElapsed(""), 0);
      return () => clearTimeout(id);
    }
    const startMs = new Date(startIso).getTime();
    const id = setInterval(() => {
      setElapsed(formatDuration(Math.floor((Date.now() - startMs) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [startIso]);

  return elapsed;
}

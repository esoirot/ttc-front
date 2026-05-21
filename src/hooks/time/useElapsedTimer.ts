import { useState, useEffect } from "react";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

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

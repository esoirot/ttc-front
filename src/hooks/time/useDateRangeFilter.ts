import { useState } from "react";
import { toEndIso, toStartIso } from "@/lib/time";

export function useDateRangeFilter() {
  const [startDate, setStartDate] = useState(() =>
    new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startIso: toStartIso(startDate),
    endIso: toEndIso(endDate),
  };
}

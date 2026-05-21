import { useState } from "react";

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
    startIso: `${startDate}T00:00:00`,
    endIso: `${endDate}T23:59:59`,
  };
}

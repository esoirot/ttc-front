import { downloadBlob } from "./utils";

export function exportCsv<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = rows.map((r) =>
    headers.map((h) => JSON.stringify(r[h] ?? "")).join(","),
  );
  const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
    type: "text/csv",
  });
  downloadBlob(blob, filename);
}
